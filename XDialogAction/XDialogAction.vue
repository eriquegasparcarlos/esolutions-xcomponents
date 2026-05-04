<script setup>
import {getCurrentInstance, ref} from 'vue';
import {useQuasar} from 'quasar';
import XInput from '../XInput/XInput.vue';
import XDialog from '../XDialog/XDialog.vue';
import XButton from '../XButton/XButton.vue';

// Define las opciones del componente
defineOptions({
  name: 'XDialogAction',
  inheritAttrs: false,
});


// Props del componente
const props = defineProps({
  resource: {type: String, required: true},
  recordId: null,
  action: {type: String, required: true}
});

// Eventos que puede emitir este componente
const emit = defineEmits(['success']);

const { proxy } = getCurrentInstance();
// Quasar instance
const $q = useQuasar();

// Estados reactivos
const isDialogOpen = ref(false);
const loading = ref(false);
const loadingSubmit = ref(false);
const title = ref('');
const errors = ref({});
const form = ref({});

// Inicializa el formulario con valores por defecto
const initForm = () => {
  title.value = '';
  errors.value = {};
  form.value = {
    id: props.recordId,
    description: '',
    password: '',
    verify_password: false,
    button_label_submit: '',
    button_color: '',
    icon: '',
    icon_color: '',
  };
};

// Maneja apertura del diálogo y carga de datos desde el backend
const handleOpen = async () => {
  loading.value = true;
  initForm();

  let url = `/${props.resource}/record-${props.action}`;
  if (props.recordId) url += `/${props.recordId}`;

  try {
    const {data} = await proxy.$api.get(url);
    const record = data.data || data;
    title.value = record.title;
    Object.assign(form.value, {
      description: record.description,
      verify_password: record.verify_password,
      button_label_submit: record.button_label_submit,
      button_color: record.button_color,
      icon: record.icon,
      icon_color: record.icon_color,
    });
  } catch {
    $q.notify({type: 'negative', message: proxy.$t('components.dialogLoadError')});
  } finally {
    loading.value = false;
  }
};

// Envío del formulario
const onSubmit = async () => {
  if (form.value.verify_password && (!form.value.password || form.value.password.length === 0)) {
    return $q.notify({type: 'error', message: proxy.$t('auth.passwordRequired')});
  }

  loading.value = true;
  loadingSubmit.value = true;

  try {
    const {data} = await proxy.$api.post(`/${props.resource}/${props.action}`, form.value);
    if (data.success) {
      $q.notify({type: 'success', message: data.message});
      emit('success', data.data);
      closeDialog();
    } else {
      $q.notify({type: 'error', message: data.message});
    }
  } catch (err) {
    errors.value = err.response?.data?.errors || {};
  } finally {
    loadingSubmit.value = false;
    loading.value = false;
  }
};

// Métodos para abrir y cerrar el diálogo
const openDialog = () => {
  isDialogOpen.value = true
};
const closeDialog = () => {
  isDialogOpen.value = false
};

// Expone la función para abrir el diálogo desde el padre
defineExpose({openDialog});
</script>

<template>
  <x-dialog v-model="isDialogOpen"
            :loading="loading"
            width="540px"
            @before-show="handleOpen">
    <!-- Slot: contenido del diálogo -->
    <template #content>
      <div class="row">
        <div class="col-4 text-center q-mt-md">
          <q-icon :name="`fal fa-${form.icon}`" size="xl" :color="form.icon_color"/>
        </div>
        <div class="col-20 q-mt-sm">
          <div class="text-weight-medium q-mb-md" style="font-size: 18px;">{{ title }}</div>
          <div class="text-grey-7" style="font-size: 15px;" v-html="form.description"></div>
          <div v-if="form.verify_password" class="q-mt-md">
            <x-input
              :label="$t('auth.enterPassword')"
              type="password"
              :dense="false"
              v-model="form.password"
              :error="errors.password"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Slot: botones de acción -->
    <template #action-buttons>
      <x-button outline color="grey-8" class="q-mr-xs" @click="closeDialog" :disable="loadingSubmit" :label="$t('common.cancel')"/>
      <x-button :color="form.button_color" @click="onSubmit" :loading="loadingSubmit" :disable="loadingSubmit"
                :label="form.button_label_submit"/>
    </template>
  </x-dialog>
</template>
