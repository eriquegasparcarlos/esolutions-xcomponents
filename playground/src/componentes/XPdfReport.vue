<script setup>
import Seccion from '../components/Seccion.vue'
import { ref, computed } from 'vue'
import XButton from '@x/XButton/XButton.vue'
import XPdfPreview from '@x/XPdfPreview/XPdfPreview.vue'
import XReportView from '@x/XReportView/XReportView.vue'

// PDF minimo valido generado al vuelo: evita depender de un archivo externo
// y hace que el visor funcione offline igual que el resto del playground.
const pdfDataUri = computed(() => {
  const contenido = `BT /F1 22 Tf 60 720 Td (Comprobante F001-000123) Tj ET
BT /F1 12 Tf 60 690 Td (Generado por el playground de x-components) Tj ET`
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ' +
      '/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = []
  objetos.forEach((o, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const inicioXref = pdf.length
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`
  offsets.forEach((o) => { pdf += String(o).padStart(10, '0') + ' 00000 n \n' })
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`
  return 'data:application/pdf;base64,' + btoa(pdf)
})

const verPdf = ref(false)

const kpis = [
  { label: 'Emitidos', value: '1,248' },
  { label: 'Aceptados', value: '1,224' },
  { label: 'Rechazados', value: '24' },
  { label: 'Total', value: 'S/ 184,320' },
]
</script>

<template>
  <Seccion titulo="XPdfPreview · XPdfViewer" nota="visor en dialogo · requiere peers opcionales" :cubre="['XPdfViewer', 'XPdfPreview']">
    <p style="margin:-6px 0 14px; font-size:12px; color:#64748b">
      Requiere las peer deps opcionales <code>@embedpdf/vue-pdf-viewer</code> y
      <code>pdfjs-dist</code>; sin ellas el componente no se puede montar. El PDF
      de muestra se arma en memoria, asi que funciona offline.
    </p>
    <div class="pg-demo">
      <XButton label="Abrir comprobante" variant="primary" @click="verPdf = true" />
    </div>
    <XPdfPreview v-model="verPdf" :src="pdfDataUri" filename="F001-000123.pdf" />
  </Seccion>

  <Seccion titulo="XReportView" nota="cabecera, breadcrumb y fila de KPIs" :cubre="['XReportView']">
    <p style="margin:-6px 0 14px; font-size:12px; color:#64748b">
      Layout de reporte (breadcrumb, titulo, descripcion y fila de KPIs). No
      expone variables <code>--x-*</code> propias: hereda de los tokens globales.
      <strong>Usa <code>q-page</code></strong>, asi que exige estar dentro de un
      <code>q-layout</code> — de ahi el envoltorio de abajo.
    </p>
    <q-layout view="hHh lpR fFf" container style="min-height:340px; border:1px solid #e2e8f0; border-radius:8px">
      <q-page-container>
        <XReportView
          :breadcrumb="[{ label: 'Inicio' }, { label: 'Reportes' }, { label: 'Comprobantes' }]"
          title="Comprobantes emitidos"
          description="Resumen del periodo en curso."
          :kpis="kpis"
          bare
        />
      </q-page-container>
    </q-layout>
  </Seccion>
</template>
