const Store = {
  data: Vue.reactive({
    coaches: [],
    students: [],
    packages: CONFIG.PACKAGES,
    invoices: [],
    lessons: []
  }),

  async init() {
    try {
      const res = await fetch('/api/data');
      const d = await res.json();
      Object.assign(this.data, d);
      
      // Data Integrity Fix: Ensure invoices have coach_id by deriving from lessons if missing
      if (this.data.invoices && this.data.lessons) {
        let missingLessons = 0;
        this.data.invoices.forEach(inv => {
          const related = this.data.lessons.filter(l => l.invoice_id === inv.id);
          if (related.length === 0 && inv.lessons_remaining > 0) missingLessons++;
          
          if (!inv.coach_id) {
            const lesson = related[0];
            if (lesson) inv.coach_id = lesson.coach_id;
          }
        });
        if (missingLessons > 0) {
          console.warn(`Data Integrity: ${missingLessons} invoices have NO associated lessons but expect more sessions.`);
        }
      }
      
      console.log('Store Initialized', this.data);
    } catch (e) {
      console.error('Failed to load data', e);
    }
  },

  async save() {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Vue.toRaw(this.data))
      });
    } catch (e) {
      console.error('Failed to save data', e);
    }
  },

  // --- Business Logic ---

  deleteCoach(id) {
    this.data.coaches = this.data.coaches.filter(c => c.id !== id);
    // Cascade: Remove lessons and update invoices? 
    // Usually, we keep invoices for accounting but clear lessons
    this.data.lessons = this.data.lessons.filter(l => l.coach_id !== id);
    this.save();
  },

  deleteStudent(id) {
    this.data.students = this.data.students.filter(s => s.id !== id);
    // Cascade: Delete all invoices and lessons related to this student
    this.data.invoices = this.data.invoices.filter(i => i.student_id !== id && !(i.participants && i.participants.includes(id)));
    this.data.lessons = this.data.lessons.filter(l => l.student_id !== id);
    this.save();
  },

  deleteInvoice(id) {
    this.data.invoices = this.data.invoices.filter(i => i.id !== id);
    this.data.lessons = this.data.lessons.filter(l => l.invoice_id !== id);
    this.save();
  },

  addInvoice(inv, lessons) {
    this.data.invoices.unshift(inv);
    this.data.lessons.push(...lessons);
    this.save();
  }
};
window.Store = Store;