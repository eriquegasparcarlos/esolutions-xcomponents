# XTreeSelect

Wrapper de `@zanmato/vue3-treeselect` para usar un select jerárquico (en árbol)
con la misma filosofía que el resto de componentes `X*` (XInput, XSelect, etc.).

- Integrado con Quasar (QForm, validaciones, clases globales).
- Modo clásico / no clásico (`isClassic`) igual que `XSelect`.
- Soporta selección simple o múltiple (se pasa vía `:multiple` en attrs).
- Normaliza las claves de los nodos (`optionValue`, `optionLabel`, `optionChildren`).

> **Importante:** las opciones se pasan desde el padre vía `:options="..."`,
como ya haces en `XSelect`. El componente sólo se encarga de normalizarlas y
dibujar el árbol.

---

## Instalación base

```bash
npm install --save @zanmato/vue3-treeselect
# o
yarn add @zanmato/vue3-treeselect
