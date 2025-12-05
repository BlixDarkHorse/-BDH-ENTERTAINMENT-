# Nébula Entertainment - Universo BDH

## Configuración de GitHub Pages con Subdominio

Este directorio contiene la configuración para desplegar el sitio web de **Nébula Entertainment** usando GitHub Pages con un subdominio personalizado.

### Estructura Actual

```
docs/
├── index.html          # Página principal (en blanco para personalización)
├── CNAME               # Configuración del subdominio
└── README.md           # Esta documentación
```

### Configuración del Subdominio

El archivo `CNAME` contiene el subdominio configurado: `nebula.bdh-entertainment.com`

#### Pasos para Activar el Subdominio:

1. **En GitHub:**
   - Ve a Settings > Pages en tu repositorio
   - En "Source", selecciona la rama y la carpeta `/docs`
   - GitHub automáticamente detectará el archivo CNAME

2. **En tu Proveedor de DNS:**
   - Agrega un registro CNAME que apunte `nebula.bdh-entertainment.com` a `blixdarkhorse.github.io`
   - O agrega registros A que apunten a las IPs de GitHub Pages:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```

3. **Verificación:**
   - GitHub verificará automáticamente el dominio
   - Una vez verificado, el sitio estará disponible en tu subdominio

### Soporte para Múltiples Subdominios

Para agregar más subdominios en el futuro, puedes:

#### Opción 1: Usar Carpetas en el Mismo Repositorio
```
docs/
├── index.html              # Sitio principal
├── CNAME                   # Dominio principal
├── proyecto2/              # Segundo sitio
│   └── index.html
└── proyecto3/              # Tercer sitio
    └── index.html
```
Los sitios estarán disponibles en:
- `nebula.bdh-entertainment.com/`
- `nebula.bdh-entertainment.com/proyecto2/`
- `nebula.bdh-entertainment.com/proyecto3/`

#### Opción 2: Usar Repositorios Separados (Recomendado)
Para cada subdominio, crea un nuevo repositorio:
```
Repositorio: BDH-ENTERTAINMENT (este)
Subdominio: nebula.bdh-entertainment.com

Repositorio: OTRO-PROYECTO
Subdominio: otro.bdh-entertainment.com
```

Cada repositorio puede tener su propio:
- Carpeta `/docs` con su propio `CNAME`
- Configuración independiente de GitHub Pages
- Control de versiones separado

#### Opción 3: Usar Branches Separadas
```
main branch: Código principal
gh-pages-nebula branch: Sitio Nébula Entertainment
gh-pages-proyecto2 branch: Otro proyecto
```

### Personalización del Sitio

El archivo `index.html` está en blanco y listo para que agregues tu contenido. Incluye:
- Estructura HTML5 básica
- Meta tags para UTF-8 y viewport responsive
- Título configurado como "Nébula Entertainment - Universo BDH"

### Recursos Adicionales

- [Documentación de GitHub Pages](https://docs.github.com/es/pages)
- [Configurar un dominio personalizado](https://docs.github.com/es/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Solución de problemas de dominios personalizados](https://docs.github.com/es/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)

---

**Universo BDH** - Sistema de entretenimiento multimedia
