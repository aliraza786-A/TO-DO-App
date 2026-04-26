 let tasks = JSON.parse(localStorage.getItem('focus_tasks') || '[]');
  let currentFilter = 'all';

  const PRIORITY_COLOR = { high: '#ff4d4d', med: '#ffb432', low: '#c8f135' };

  function save() {
    localStorage.setItem('focus_tasks', JSON.stringify(tasks));
  }

  function showTooltip(msg) {
    const t = document.getElementById('tooltip');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1800);
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function updateStats() {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-done').textContent = done;
    document.getElementById('stat-left').textContent = total - done;
    const pct = total ? Math.round((done / total) * 100) : 0;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progress-pct').textContent = pct + '%';
    const left = tasks.filter(t => !t.done).length;
    document.getElementById('countText').textContent = `${left} task${left !== 1 ? 's' : ''} remaining`;
  }

  function getFiltered() {
    switch (currentFilter) {
      case 'active': return tasks.filter(t => !t.done);
      case 'done': return tasks.filter(t => t.done);
      case 'high': return tasks.filter(t => t.priority === 'high');
      case 'med': return tasks.filter(t => t.priority === 'med');
      case 'low': return tasks.filter(t => t.priority === 'low');
      default: return tasks;
    }
  }

  function render() {
    const list = document.getElementById('taskList');
    const empty = document.getElementById('emptyState');
    const filtered = getFiltered();

    list.innerHTML = '';
    empty.style.display = filtered.length === 0 ? 'block' : 'none';

    filtered.forEach(task => {
      const item = document.createElement('div');
      item.className = 'task-item' + (task.done ? ' done' : '');
      item.dataset.id = task.id;
      item.style.setProperty('--priority-color', PRIORITY_COLOR[task.priority]);

      item.innerHTML = `
        <button class="check-btn ${task.done ? 'checked' : ''}" onclick="toggleTask('${task.id}')"></button>
        <div class="task-content">
          <div class="task-text">${escHtml(task.text)}</div>
          <div class="task-meta">
            <span class="priority-tag p-${task.priority}">${task.priority}</span>
            <span class="task-time">${formatTime(task.ts)}</span>
          </div>
        </div>
        <button class="del-btn" onclick="deleteTask('${task.id}')" title="Delete">✕</button>
      `;
      list.appendChild(item);
    });

    updateStats();
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (!text) { input.focus(); return; }

    const priority = document.getElementById('prioritySelect').value;
    tasks.unshift({ id: Date.now().toString(), text, priority, done: false, ts: Date.now() });
    save();
    render();
    input.value = '';
    input.focus();
    showTooltip('Task added ✓');
  }

  function toggleTask(id) {
    const t = tasks.find(t => t.id === id);
    if (t) { t.done = !t.done; save(); render(); }
  }

  function deleteTask(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.classList.add('removing');
      setTimeout(() => {
        tasks = tasks.filter(t => t.id !== id);
        save();
        render();
      }, 280);
    }
  }

  document.getElementById('addBtn').addEventListener('click', addTask);
  document.getElementById('taskInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  document.getElementById('clearDone').addEventListener('click', () => {
    const count = tasks.filter(t => t.done).length;
    if (!count) { showTooltip('No completed tasks'); return; }
    tasks = tasks.filter(t => !t.done);
    save();
    render();
    showTooltip(`Cleared ${count} task${count > 1 ? 's' : ''}`);
  });

  render();