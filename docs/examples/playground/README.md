# Playground — ejemplo de referencia

El icono de **Playground** (una app de desarrollo React Native/Expo) es el estándar de
calidad al que apunta este skill. Está incluido como **guía inspiracional**, no como
plantilla.

| Archivo | Qué es |
|---|---|
| `brief.md` | El brief que lo produjo (versión corta + versión con geometría explícita). |
| `icon.svg` | El glyph final, tal como entró al factory de Portal. |
| `preview.png` | El icono generado (`assets/icons/production/icon.png`). |

## Por qué funciona

1. **Una idea en una frase** — *"Un espacio donde podés experimentar"* — y una
   **segunda lectura** que nunca se dice de forma literal (la **P**).
2. **Pocas formas, bien construidas.** Tres primitivas (asta, bucle, núcleo) que
   interactúan; nada decorativo.
3. **Geometría concreta.** Grilla con canal continuo de 40 px y **radios concéntricos**
   (168 / 120 / 48). Eso es lo que hace que se sienta *construido* y no "generado".
4. **Personalidad desde la forma.** Premium/playful/elegante nacen de la proporción y
   del movimiento entre módulos — no de ilustración ni de iconos obvios de código.
5. **Color con dirección.** Familia teal/cyan/mint sobre un obsidiana profundo, con un
   resplandor radial sutil que da profundidad.
6. **Silueta primero.** Funciona sin el nombre, en blanco y negro, y a 16 px.

## Nota sobre el modo de composición

Este glyph es **`composed`**: incluye el tile de fondo a sangre (`<rect rx="224">`) y
el glow. Es una elección válida y de gran impacto visual. Sus tradeoffs están
documentados en `composition-modes.md`:

- el color de fondo de iOS/Android queda redundante (el tile ya trae el suyo);
- en **monochrome** (Android themed icons) se convierte en un bloque sólido.

Si tu app necesita theming/monochrome real, el modo `symbol` (fondo provisto por
Portal) es la mejor opción. La decisión es del modelo, según el brief.
