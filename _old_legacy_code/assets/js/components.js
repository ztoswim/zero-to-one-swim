/**
 * Swim Academy — Shared UI Components
 */




const WheelDateInput = {
  template: `
    <div class="input-field flex items-center bg-white group focus-within:ring-4 focus-within:border-primary-500" style="cursor: default;">
      <div class="flex items-center gap-1 font-black text-gray-900 tracking-tighter mx-auto select-none">
        <input class="hover:bg-primary-50 px-0.5 py-1 rounded cursor-ns-resize transition-colors text-center bg-transparent outline-none appearance-none hide-spinners" style="width: 2.5ch"
               v-model="inputDay" @wheel.prevent="adjust('day', $event)" @blur="format" maxlength="2">
        <span class="text-gray-300">/</span>
        <input class="hover:bg-primary-50 px-0.5 py-1 rounded cursor-ns-resize transition-colors text-center bg-transparent outline-none appearance-none hide-spinners" style="width: 2.5ch"
               v-model="inputMonth" @wheel.prevent="adjust('month', $event)" @blur="format" maxlength="2">
        <span class="text-gray-300">/</span>
        <input class="hover:bg-primary-50 px-0.5 py-1 rounded cursor-ns-resize transition-colors text-center bg-transparent outline-none appearance-none hide-spinners" style="width: 4.5ch"
               v-model="inputYear" @wheel.prevent="adjust('year', $event)" @blur="format" maxlength="4">
      </div>
    </div>
  `,
  props: ['modelValue'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const d = new Date();
    const initVal = props.modelValue || `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    const inputYear = Vue.ref('');
    const inputMonth = Vue.ref('');
    const inputDay = Vue.ref('');

    const updateInputs = (val) => {
      if (!val) return;
      const [y, m, dd] = val.split('-');
      inputYear.value = y;
      inputMonth.value = m;
      inputDay.value = dd;
    };
    updateInputs(initVal);
    if (!props.modelValue) {
      emit('update:modelValue', initVal);
    }
    Vue.watch(() => props.modelValue, updateInputs);

    const maxDays = (y, m) => new Date(y, m, 0).getDate();

    const syncAndEmit = (y, m, dd) => {
       let yy = parseInt(y)||new Date().getFullYear();
       let mm = parseInt(m)||1;
       let dVal = parseInt(dd)||1;
       if(mm < 1) mm = 12; if(mm > 12) mm = 1;
       const max = maxDays(yy, mm);
       if(dVal < 1) dVal = max; if(dVal > max) dVal = max;
       
       inputYear.value = yy;
       inputMonth.value = String(mm).padStart(2, '0');
       inputDay.value = String(dVal).padStart(2, '0');
       emit('update:modelValue', `${yy}-${inputMonth.value}-${inputDay.value}`);
    };

    const adjust = (type, event) => {
      const delta = event.deltaY > 0 ? -1 : 1;
      let yy = parseInt(inputYear.value);
      let mm = parseInt(inputMonth.value);
      let dd = parseInt(inputDay.value);
      if (type === 'year') yy += delta;
      if (type === 'month') mm += delta;
      if (type === 'day') dd += delta;
      syncAndEmit(yy, mm, dd);
    };
    
    const format = () => {
       syncAndEmit(inputYear.value, inputMonth.value, inputDay.value);
    };

    return { inputYear, inputMonth, inputDay, adjust, format };
  }
};

const WheelTimeInput = {
  template: `
    <div class="input-field flex items-center bg-white group focus-within:ring-4 focus-within:border-primary-500" style="cursor: default;">
      <div class="flex items-center gap-1 font-black text-gray-900 tracking-tighter mx-auto select-none">
        <input class="hover:bg-primary-50 px-0.5 py-1 rounded cursor-ns-resize transition-colors text-center bg-transparent outline-none appearance-none hide-spinners" style="width: 2.5ch"
               v-model="inputHour" @wheel.prevent="adjust('hour', $event)" @blur="format" maxlength="2">
        <span class="text-gray-300">:</span>
        <input class="hover:bg-primary-50 px-0.5 py-1 rounded cursor-ns-resize transition-colors text-center bg-transparent outline-none appearance-none hide-spinners" style="width: 2.5ch"
               v-model="inputMinute" @wheel.prevent="adjust('minute', $event)" @blur="format" maxlength="2">
        <div class="hover:bg-primary-50 px-1 py-1 rounded cursor-ns-resize transition-colors ml-0.5 text-primary-500 cursor-pointer text-center" style="width: 3.5ch"
             @wheel.prevent="adjust('ampm', $event)" @click="toggleAmpm">{{ inputAmpm }}</div>
      </div>
    </div>
  `,
  props: ['modelValue'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const initVal = props.modelValue || "12:00";
    
    const inputHour = Vue.ref('');
    const inputMinute = Vue.ref('');
    const inputAmpm = Vue.ref('');

    const updateInputs = (val) => {
      if (!val) return;
      const [hStr, mStr] = val.split(':');
      let h = parseInt(hStr);
      inputAmpm.value = h >= 12 ? 'PM' : 'AM';
      let displayH = h % 12;
      if (displayH === 0) displayH = 12;
      inputHour.value = String(displayH).padStart(2, '0');
      inputMinute.value = mStr;
    };
    updateInputs(initVal);
    if (!props.modelValue) {
      let [h, m] = initVal.split(':');
      emit('update:modelValue', `${h}:${m}`);
    }
    Vue.watch(() => props.modelValue, updateInputs);

    const syncAndEmit = (h, m, ampm) => {
       let hh = parseInt(h)||12;
       let mm = parseInt(m)||0;
       if (hh < 1) hh = 12; if (hh > 12) hh = 1;
       if (mm < 0) mm = 55; if (mm > 59) mm = 0;
       
       inputHour.value = String(hh).padStart(2, '0');
       inputMinute.value = String(mm).padStart(2, '0');
       inputAmpm.value = ampm;

       let internalH = hh % 12;
       if (ampm === 'PM') internalH += 12;
       emit('update:modelValue', `${String(internalH).padStart(2, '0')}:${inputMinute.value}`);
    };

    const adjust = (type, event) => {
      const delta = event.deltaY > 0 ? -1 : 1;
      let hh = parseInt(inputHour.value);
      let mm = parseInt(inputMinute.value);
      let ampm = inputAmpm.value;
      
      if (type === 'hour') hh += delta;
      if (type === 'minute') {
         mm += delta * 5;
         if (mm >= 60) { mm -= 60; hh += 1; }
         if (mm < 0) { mm += 60; hh -= 1; }
      }
      if (type === 'ampm') {
         ampm = ampm === 'AM' ? 'PM' : 'AM';
      }
      syncAndEmit(hh, mm, ampm);
    };
    
    const format = () => {
       syncAndEmit(inputHour.value, inputMinute.value, inputAmpm.value);
    };
    
    const toggleAmpm = () => {
       syncAndEmit(inputHour.value, inputMinute.value, inputAmpm.value === 'AM' ? 'PM' : 'AM');
    };

    return { inputHour, inputMinute, inputAmpm, adjust, format, toggleAmpm };
  }
};

const GlobalModals = {
  template: `
    <div>
      <!-- Lesson Status Modal -->
      <div v-if="modal.open" class="modal-overlay" @click.self="modal.open=false">
        <div class="modal-content modal-sm animate-in">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
            <h3 class="font-bold text-lg text-gray-900">Manage Lesson</h3>
            <button @click="modal.open=false" class="close-btn" aria-label="Close">
              <i data-lucide="x"></i>
            </button>
          </div>
          
          <div class="p-6 space-y-6">
            <div class="p-4 bg-primary-50 rounded-2xl border border-primary-100">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-primary-500">
                  <i data-lucide="user" class="w-4 h-4"></i>
                </div>
                <p class="font-black text-primary-800">{{ U.name(modal.l?.student_id, store.students, store.coaches) }}</p>
              </div>
              <div class="flex items-center gap-3 mb-3 pl-1">
                <div class="w-2 h-2 rounded-full bg-primary-400"></div>
                <p class="text-[10px] font-black text-primary-400 uppercase tracking-widest">Coach: {{ U.name(modal.l?.coach_id, store.students, store.coaches) }}</p>
              </div>
              <div class="text-xs font-bold text-primary-600 bg-white/50 px-3 py-2 rounded-lg inline-block flex items-center gap-2">
                <i data-lucide="calendar" class="w-3 h-3"></i> {{ modal.l?.lesson_date }} <span class="mx-1 opacity-30">|</span> {{ U.timeAMPM(modal.l?.start_time) }}
                <span class="mx-1 opacity-30">•</span> {{ modal.l?.duration || 45 }}m
              </div>
              <div v-if="modal.l?.type==='makeup'" class="mt-2 text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-100 px-2 py-1 rounded-md inline-flex items-center gap-1.5">
                <i data-lucide="refresh-cw" class="w-3 h-3"></i> Replacement Lesson
              </div>
            </div>

            <div v-if="modal.l?.status==='scheduled'" class="space-y-3">
              <!-- Step 1: Initial Buttons -->
              <div v-if="!confirmStep" class="space-y-3 animate-in">
                <button @click="confirmStep='completed'" 
                        class="w-full py-4 bg-success text-white font-black rounded-2xl shadow-lg shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                  Mark as Completed <i data-lucide="check-circle" class="w-5 h-5"></i>
                </button>
                
                <div class="pt-4 border-t border-gray-100">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Issues or Rescheduling</p>
                  <div class="grid grid-cols-2 gap-3">
                    <button @click="confirmStep='burn'" class="flex flex-col items-center gap-1 p-3 rounded-2xl border-2 border-red-50 bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      <i data-lucide="flame" class="w-6 h-6 mb-1"></i>
                      <span class="text-[10px] font-black uppercase">Burn Lesson</span>
                      <span class="text-[7px] font-bold opacity-60">Deduct Session</span>
                    </button>
                    <button @click="emit('status','pending')" class="flex flex-col items-center gap-1 p-3 rounded-2xl border-2 border-purple-50 bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">
                      <i data-lucide="clock" class="w-6 h-6 mb-1"></i>
                      <span class="text-[10px] font-black uppercase">Pending</span>
                      <span class="text-[7px] font-bold opacity-60">TBA Later</span>
                    </button>
                    <button @click="emit('makeup')" class="flex flex-col items-center gap-1 p-3 rounded-2xl border-2 border-orange-50 bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors col-span-2">
                      <i data-lucide="repeat" class="w-6 h-6 mb-1"></i>
                      <span class="text-[10px] font-black uppercase">Schedule Replacement</span>
                    </button>
                    <button @click="emit('postpone')" class="flex flex-col items-center gap-1 p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors col-span-2">
                      <i data-lucide="fast-forward" class="w-6 h-6 mb-1"></i>
                      <span class="text-[10px] font-black uppercase tracking-widest">Postpone Everything One Week</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Step 2: Confirmation -->
              <div v-else class="p-8 bg-gray-900 rounded-[2.5rem] text-white text-center animate-in shadow-2xl">
                <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-white/10 text-white">
                  <i :data-lucide="confirmStep === 'completed' ? 'check-circle' : 'alert-triangle'" class="w-10 h-10"></i>
                </div>
                <h4 class="text-2xl font-black mb-2 uppercase tracking-tight">Double Check!</h4>
                <p class="text-sm font-bold opacity-60 mb-8 px-4">
                  Are you sure you want to 
                  <span :class="confirmStep === 'completed' ? 'text-success' : 'text-red-400'">
                    {{ confirmStep === 'completed' ? 'MARK COMPLETED' : 'BURN' }}
                  </span> 
                  this session for <b>{{ U.name(modal.l?.student_id, store.students) }}</b>?
                </p>
                <div class="flex flex-col gap-3">
                  <button @click="executeAction" 
                          :class="[
                            'w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95',
                            confirmStep === 'completed' ? 'bg-success hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                          ]">
                    Confirm Action
                  </button>
                  <button @click="confirmStep=null" class="w-full py-3 text-sm font-bold opacity-40 hover:opacity-100 transition-opacity">
                    Wait, let me go back
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="text-center p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 border-dashed">
              <div class="text-3xl mb-3 text-gray-300 flex justify-center">
                <i data-lucide="info" class="w-10 h-10"></i>
              </div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lesson Status</p>
              <p class="text-xl font-black text-gray-900 mb-6">{{ U.text(modal.l?.status) }}</p>
              
              <div class="grid grid-cols-1 gap-2">
                <button v-if="['pending','flex','absent','burn'].includes(modal.l?.status)" @click="emit('makeup')" 
                        class="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-100 flex items-center justify-center gap-2">
                  Schedule Replacement Now <i data-lucide="repeat" class="w-4 h-4"></i>
                </button>
                <button @click="emit('status','scheduled')" 
                        class="w-full py-3 bg-white text-gray-400 font-bold rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  Reset to Scheduled
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Makeup Selection Modal -->
      <div v-if="modal.makeup" class="modal-overlay" @click.self="modal.makeup=false">
        <div class="modal-content modal-sm animate-in">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
            <h3 class="font-bold text-lg text-gray-900">Schedule Replacement</h3>
            <button @click="modal.makeup=false" class="close-btn" aria-label="Close">
              <i data-lucide="x"></i>
            </button>
          </div>
          
          <div class="p-6 space-y-6">
            <div class="p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p class="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Original Session</p>
              <p class="font-bold text-orange-800">{{ modal.l?.lesson_date }} <span class="opacity-30 mx-1">|</span> {{ U.timeAMPM(modal.l?.start_time) }}</p>
            </div>

            <div class="space-y-4">
              <div class="form-group">
                <label class="label">New Date <span class="text-primary-500 font-black">*</span></label>
                <wheel-date-input v-model="mk.date" class="h-12"></wheel-date-input>
              </div>
              <div class="form-group">
                <label class="label">New Time <span class="text-primary-500 font-black">*</span></label>
                <wheel-time-input v-model="mk.time" class="h-12"></wheel-time-input>
              </div>
            </div>

            <div class="flex gap-3">
              <button @click="modal.makeup=false" class="btn btn-secondary flex-1 py-3 text-sm">Cancel</button>
              <button @click="emit('confirm-makeup')" class="btn btn-primary flex-1 py-3 text-sm font-black flex items-center justify-center gap-2">
                Confirm <i data-lucide="send" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Notification Modal (Success/Error/Warning) -->
      <div v-if="modal.success" class="modal-overlay" @click.self="modal.success=false">
        <div class="modal-content modal-sm animate-in text-center p-10">
          <div :class="[
            'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 scale-110',
            modal.successType === 'error' ? 'bg-red-50 text-red-500 ring-8 ring-red-50/50' : 
            modal.successType === 'warning' ? 'bg-orange-50 text-orange-500 ring-8 ring-orange-50/50' : 
            'bg-green-50 text-success ring-8 ring-green-50/50'
          ]">
            <i :data-lucide="modal.successType === 'error' ? 'alert-circle' : modal.successType === 'warning' ? 'alert-triangle' : 'check-circle-2'" class="w-10 h-10"></i>
          </div>
          <h3 class="text-2xl font-black text-gray-900 mb-2 tracking-tighter">{{ modal.successTitle || (modal.successType === 'error' ? 'Oops!' : modal.successType === 'warning' ? 'Notice' : 'Success!') }}</h3>
          <p class="text-gray-400 font-bold mb-8 text-sm leading-relaxed">{{ modal.successMessage || 'Action completed successfully.' }}</p>
          <button @click="emit('success-confirm')" 
                  :class="['w-full py-4 font-black rounded-2xl transition-all active:scale-95 shadow-lg', 
                  modal.successType === 'error' ? 'bg-red-500 text-white shadow-red-100' : 
                  modal.successType === 'warning' ? 'bg-orange-500 text-white shadow-orange-100' : 
                  'bg-primary-500 text-white shadow-primary-100']">
            Continue
          </button>
        </div>
      </div>
    </div>
  `,
  props: ['modal', 'mk', 'store'],
  emits: ['status', 'makeup', 'postpone', 'confirm-makeup', 'success-confirm'],
  components: { 'wheel-date-input': WheelDateInput, 'wheel-time-input': WheelTimeInput },
  setup(props, { emit }) {
    Vue.watch(() => props.modal.open, (val) => {
      if (val) Vue.nextTick(() => window.lucide && lucide.createIcons());
    });
    Vue.watch(() => props.modal.makeup, (val) => {
      if (val) Vue.nextTick(() => window.lucide && lucide.createIcons());
    });
    Vue.watch(() => props.modal.success, (val) => {
      if (val) Vue.nextTick(() => window.lucide && lucide.createIcons());
    });
    const confirmStep = Vue.ref(null);
    Vue.watch(() => props.modal.open, (open) => { if(!open) confirmStep.value = null; });

    const executeAction = () => {
      const status = confirmStep.value === 'completed' ? 'completed' : 'absent'; // 'burn' internally uses 'absent' status for deduction
      emit('status', status);
      confirmStep.value = null;
    };

    return { U: window.U, store: props.store, confirmStep, executeAction, emit };
  }
};

const StudentModal = {
  template: `
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content modal-lg animate-in">
        <div class="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-[2.5rem]">
          <div>
            <h3 class="text-3xl font-black text-gray-900 tracking-tighter">{{ isEdit ? 'Edit Profile' : 'New Registration' }}</h3>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Manage student credentials and family info</p>
          </div>
          <button @click="$emit('close')" class="close-btn p-2 hover:bg-gray-50 rounded-xl transition-colors" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div class="p-10 overflow-y-auto max-h-[75vh] bg-white">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div class="space-y-8">
              <div>
                <h4 class="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-6">Personal Details</h4>
                <div class="space-y-6">
                  <div class="form-group">
                    <label class="label">Student Full Name *</label>
                    <input v-model="form.name" class="input-field" placeholder="Full legal name">
                  </div>
                  <div class="grid grid-cols-2 gap-6">
                    <div class="form-group">
                      <label class="label">Gender</label>
                      <select v-model="form.gender" class="input-field appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="label">Date of Birth</label>
                      <wheel-date-input v-model="form.dob"></wheel-date-input>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="label">Mobile Number *</label>
                    <input v-model="form.phone" class="input-field" placeholder="Primary contact">
                  </div>
                  <div class="form-group">
                    <label class="label">Email Address</label>
                    <input v-model="form.email" type="email" class="input-field" placeholder="email@example.com">
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-10">
              <div class="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Parental Information</h4>
                <div class="space-y-6">
                  <div class="form-group">
                    <label class="label">Guardian Name</label>
                    <input v-model="form.parent_name" class="input-field bg-white" placeholder="Full name">
                  </div>
                  <div class="form-group">
                    <label class="label">Residential Area Tag</label>
                    <input v-model="form.sameArea" class="input-field bg-white" placeholder="e.g. Block A / Garden X">
                  </div>
                </div>
              </div>
              
              <div class="p-8 bg-red-50/50 rounded-[2.5rem] border border-red-100/50">
                <h4 class="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-6">Emergency Contact</h4>
                <div class="grid grid-cols-1 gap-4">
                  <input v-model="form.emergency_name" class="input-field border-red-100 bg-white" placeholder="Contact Person">
                  <input v-model="form.emergency_phone" class="input-field border-red-100 bg-white" placeholder="Emergency Phone">
                </div>
              </div>
            </div>

            <div class="lg:col-span-2 pt-6 border-t border-gray-50">
              <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Additional Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="form-group">
                  <label class="label">Full Home Address</label>
                  <textarea v-model="form.address" class="input-field h-32 resize-none py-4" placeholder="Detailed address..."></textarea>
                </div>
                <div class="form-group">
                  <label class="label">Internal Notes / Health Issues</label>
                  <textarea v-model="form.notes" class="input-field h-32 resize-none py-4" placeholder="Any allergies, swimming level..."></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-10 py-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50 rounded-b-[2.5rem]">
          <button @click="$emit('close')" class="btn btn-secondary px-8">Discard</button>
          <button @click="$emit('save')" class="btn btn-primary px-10 shadow-xl shadow-primary-200">Save Profile</button>
        </div>
      </div>
    </div>
  `,
  props: ['show', 'form', 'isEdit'],
  emits: ['close', 'save'],
  components: { 'wheel-date-input': WheelDateInput },
  setup(props) {
    Vue.watch(() => props.show, (val) => {
      if (val) Vue.nextTick(() => window.lucide && lucide.createIcons());
    });
  }
};

const AppFactory = {
  create(config) {
    const app = Vue.createApp({
      setup() {
        Vue.onMounted(() => {
          if (window.lucide) lucide.createIcons();
        });
        return config.setup();
      }
    });

    // Global Components
    app.component('wheel-date-input', WheelDateInput);
    app.component('wheel-time-input', WheelTimeInput);
    app.component('global-modals', GlobalModals);
    app.component('student-modal', StudentModal);

    // Mount
    app.mount('#app');
    return app;
  }
};
window.AppFactory = AppFactory;