# -*- coding: utf-8 -*-
"""
Generador HLS universal para capitulos MKV.

Ejemplos:
    python GeneradorHLSUniversal.py --serie S32
    python GeneradorHLSUniversal.py --serie S92

Un archivo llamado Serie_1x4.mkv se guarda en S32-T1-C4
si se ejecuta con --serie S32. Tambien acepta nombres como S92-T1-C4.mkv.

Genera video H.264 por copia directa y audios AAC estereo para que Chrome/MSE
pueda reproducirlos. Crea o conserva una clave AES por carpeta.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import uuid
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
FFMPEG_EXE = Path(r"F:\bin\ffmpeg.exe")
FFPROBE_EXE = Path(r"F:\bin\ffprobe.exe")
KEY_LABEL = "audio_spa_1"


def ffprobe_streams(mkv: Path) -> list[dict]:
    resultado = subprocess.run(
        [str(FFPROBE_EXE), "-v", "error", "-show_streams", "-print_format", "json", str(mkv)],
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(resultado.stdout).get("streams", [])


def crear_o_reusar_key(out_dir: Path) -> Path:
    """No cambia una clave existente para no romper videos ya publicados."""
    key_path = out_dir / f"{KEY_LABEL}_aes.key"
    if not key_path.exists():
        key_path.write_bytes(uuid.uuid4().bytes)
    if key_path.stat().st_size != 16:
        raise RuntimeError(f"La clave no mide 16 bytes: {key_path}")

    keyinfo = out_dir / f"aes_{KEY_LABEL}_keyinfo.txt"
    keyinfo.write_text(f"{key_path.name}\n{key_path.resolve()}\n", encoding="utf-8")
    return keyinfo


def destino_desde_nombre(nombre: str, serie_defecto: str) -> tuple[str, str, str] | None:
    """Devuelve (serie, temporada, capitulo) a partir del nombre del MKV."""
    stem = Path(nombre).stem

    directo = re.search(r"(?i)(S\d+)[-_ ]?T(\d+)[-_ ]?C(\d+)", stem)
    if directo:
        serie, temporada, capitulo = directo.groups()
        return serie.upper(), str(int(temporada)), str(int(capitulo))

    corto = re.search(r"(?i)(\d+)\s*[xX]\s*(\d+)", stem)
    if corto:
        temporada, capitulo = corto.groups()
        return serie_defecto.upper(), str(int(temporada)), str(int(capitulo))

    return None


def normalizar_master(contenido: str, vtt_files: list[str]) -> str:
    """Deja un master limpio: audio estereo, un DEFAULT y sin niveles AAC duplicados."""
    lineas = contenido.splitlines()
    salida: list[str] = []
    audio_default_asignado = False
    i = 0

    while i < len(lineas):
        linea = lineas[i]
        limpia = linea.strip()

        if limpia.startswith("#EXT-X-MEDIA:TYPE=SUBTITLES"):
            i += 1
            continue

        if limpia.startswith("#EXT-X-MEDIA:TYPE=AUDIO"):
            linea = re.sub(r'CHANNELS="[^"]+"', 'CHANNELS="2"', linea)
            if not audio_default_asignado:
                linea = re.sub(r"DEFAULT=(YES|NO)", "DEFAULT=YES", linea, flags=re.IGNORECASE)
                audio_default_asignado = True
            else:
                linea = re.sub(r"DEFAULT=(YES|NO)", "DEFAULT=NO", linea, flags=re.IGNORECASE)
            salida.append(linea)
            i += 1
            continue

        if limpia.startswith("#EXT-X-STREAM-INF:"):
            es_nivel_audio = (
                "RESOLUTION=" not in limpia
                and re.search(r"mp4a\.", limpia, re.IGNORECASE) is not None
            )
            if es_nivel_audio:
                i += 2  # tambien elimina la URI del nivel de audio duplicado
                continue

            linea = re.sub(r',SUBTITLES="[^"]+"', "", linea)
            linea = re.sub(r",mp4a\.[^\"]+", "", linea)
            if vtt_files:
                linea += ',SUBTITLES="subs"'
            salida.append(linea)
            i += 1
            continue

        salida.append(linea)
        i += 1

    subs = [
        f'#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="{label}",'
        f'DEFAULT={default},AUTOSELECT=YES,URI="{nombre}"'
        for nombre, label, default in vtt_files
    ]
    if subs:
        posicion = 1 if salida and salida[0].strip() == "#EXTM3U" else 0
        salida[posicion:posicion] = subs

    return "\n".join(salida).rstrip() + "\n"


def extraer_subtitulos(mkv: Path, out_dir: Path, subtitulos: list[dict]) -> list[str]:
    archivos: list[str] = []
    for i, _ in enumerate(subtitulos):
        nombre = f"subtitulo_{i}.vtt"
        destino = out_dir / nombre
        subprocess.run(
            [str(FFMPEG_EXE), "-y", "-i", str(mkv), "-map", f"0:s:{i}", str(destino)],
            check=True,
        )
        archivos.append(nombre)
    return archivos


def procesar_mkv(mkv: Path, serie_defecto: str) -> None:
    identificacion = destino_desde_nombre(mkv.name, serie_defecto)
    if not identificacion:
        raise RuntimeError("el nombre debe contener 1x4 o Sxx-T1-C4")

    serie, temporada, capitulo = identificacion
    out_dir = BASE_DIR / f"{serie}-T{temporada}-C{capitulo}"
    out_dir.mkdir(parents=True, exist_ok=True)

    streams = ffprobe_streams(mkv)
    audios = [s for s in streams if s.get("codec_type") == "audio"]
    subtitulos = [s for s in streams if s.get("codec_type") == "subtitle"]
    if not audios:
        raise RuntimeError("el MKV no tiene pistas de audio")

    keyinfo = crear_o_reusar_key(out_dir)
    vtt_files = extraer_subtitulos(mkv, out_dir, subtitulos)

    comando = [
        str(FFMPEG_EXE),
        "-hide_banner",
        "-y",
        "-i",
        str(mkv),
        "-map",
        "0:v:0",
        "-c:v",
        "copy",
    ]

    stream_map = "v:0,agroup:audios,name:Video_Original"
    for i, _ in enumerate(audios):
        comando.extend(["-map", f"0:a:{i}"])
        nombre = "Latino" if i == 0 else f"Idioma_{i}"
        stream_map += f" a:{i},agroup:audios,name:{nombre}"

    comando.extend(
        [
            "-c:a",
            "aac",
            "-profile:a",
            "aac_low",
            "-ac",
            "2",
            "-ar",
            "48000",
            "-b:a",
            "192k",
            "-f",
            "hls",
            "-hls_time",
            "10",
            "-hls_playlist_type",
            "vod",
            "-hls_key_info_file",
            str(keyinfo),
            "-master_pl_name",
            "master.m3u8",
            "-var_stream_map",
            stream_map,
            str(out_dir / "stream_%v.m3u8"),
        ]
    )

    print(f"\nProcesando: {mkv.name}")
    print(f"Destino:    {out_dir.name}")
    print("Video:      copia directa, sin libx264")
    print("Audio:      AAC-LC estéreo, 48 kHz")
    subprocess.run(comando, check=True)

    master = out_dir / "master.m3u8"
    if master.exists():
        vtt_info = [
            (nombre, "Español" if i == 0 else "English", "YES" if i == 0 else "NO")
            for i, nombre in enumerate(vtt_files)
        ]
        master.write_text(
            normalizar_master(master.read_text(encoding="utf-8"), vtt_info),
            encoding="utf-8",
        )

    print("OK: paquete HLS generado.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--serie",
        default="S32",
        help="serie para nombres tipo 1x4; ejemplo: S32 o S92",
    )
    args = parser.parse_args()
    serie = args.serie.upper()
    if not re.fullmatch(r"S\d+", serie):
        print("ERROR: --serie debe tener formato S32, S92, etc.")
        return 1
    if not FFMPEG_EXE.is_file() or not FFPROBE_EXE.is_file():
        print("ERROR: faltan F:\\bin\\ffmpeg.exe o F:\\bin\\ffprobe.exe")
        return 1

    mkvs = sorted(BASE_DIR.glob("*.mkv"))
    if not mkvs:
        print(f"ERROR: no hay MKV junto a este script: {BASE_DIR}")
        return 1

    errores = 0
    for mkv in mkvs:
        try:
            procesar_mkv(mkv, serie)
        except Exception as exc:
            errores += 1
            print(f"ERROR en {mkv.name}: {exc}")

    print(f"\nFinalizado con {errores} error(es).")
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
