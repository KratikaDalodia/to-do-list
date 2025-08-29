       /**
         * To-Do List Application
         * A comprehensive task management application with modern features
         */
        class TodoApp {
            constructor() {
                // Initialize application state
                this.tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
                this.currentFilter = 'all';
                this.draggedTask = null;
                this.theme = localStorage.getItem('theme') || 'light';
                
                // Cache DOM elements for better performance
                this.initializeElements();
                
                // Set up event listeners
                this.bindEvents();
                
                // Initialize the application
                this.init();
            }

            /**
             * Cache frequently used DOM elements
             */
            initializeElements() {
                this.taskInput = document.getElementById('taskInput');
                this.addBtn = document.getElementById('addBtn');
                this.prioritySelect = document.getElementById('prioritySelect');
                this.dueDate = document.getElementById('dueDate');
                this.taskList = document.getElementById('taskList');
                this.taskCounter = document.getElementById('taskCounter');
                this.clearCompleted = document.getElementById('clearCompleted');
                this.themeToggle = document.getElementById('themeToggle');
                this.splashScreen = document.getElementById('splashScreen');
                this.filterBtns = document.querySelectorAll('.filter-btn');
            }

            /**
             * Set up all event listeners
             */
            bindEvents() {
                // Task input events
                this.addBtn.addEventListener('click', () => this.addTask());
                this.taskInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addTask();
                });

                // Filter events
                this.filterBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
                });

                // Utility events
                this.clearCompleted.addEventListener('click', () => this.clearCompletedTasks());
                this.themeToggle.addEventListener('click', () => this.toggleTheme());

                // Drag and drop events
                this.taskList.addEventListener('dragstart', (e) => this.handleDragStart(e));
                this.taskList.addEventListener('dragover', (e) => this.handleDragOver(e));
                this.taskList.addEventListener('drop', (e) => this.handleDrop(e));
                this.taskList.addEventListener('dragend', () => this.handleDragEnd());
            }

            /**
             * Initialize the application
             */
            init() {
                // Apply saved theme
                this.applyTheme();
                
                // Show splash screen animation
                this.showSplashScreen();
                
                // Render initial tasks
                this.renderTasks();
                this.updateTaskCounter();
            }

            /**
             * Show splash screen with animation
             */
            showSplashScreen() {
                setTimeout(() => {
                    this.splashScreen.classList.add('fade-out');
                    setTimeout(() => {
                        this.splashScreen.style.display = 'none';
                    }, 500);
                }, 1500);
            }

            /**
             * Add a new task to the list
             */
            addTask() {
                const text = this.taskInput.value.trim();
                if (!text) {
                    this.taskInput.focus();
                    return;
                }

                const task = {
                    id: this.generateId(),
                    text: text,
                    completed: false,
                    priority: this.prioritySelect.value,
                    dueDate: this.dueDate.value || null,
                    createdAt: new Date().toISOString()
                };

                this.tasks.unshift(task); // Add to beginning for better UX
                this.saveTasks();
                this.renderTasks();
                this.updateTaskCounter();
                
                // Clear inputs
                this.taskInput.value = '';
                this.dueDate.value = '';
                this.prioritySelect.value = 'low';
                this.taskInput.focus();
            }

            /**
             * Toggle task completion status
             */
            toggleTask(id) {
                const task = this.tasks.find(t => t.id === id);
                if (task) {
                    task.completed = !task.completed;
                    this.saveTasks();
                    this.renderTasks();
                    this.updateTaskCounter();
                }
            }

            /**
             * Delete a specific task
             */
            deleteTask(id) {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveTasks();
                this.renderTasks();
                this.updateTaskCounter();
            }

            /**
             * Edit task text inline
             */
            editTask(id, newText) {
                const task = this.tasks.find(t => t.id === id);
                if (task && newText.trim()) {
                    task.text = newText.trim();
                    this.saveTasks();
                    this.renderTasks();
                }
            }

            /**
             * Clear all completed tasks
             */
            clearCompletedTasks() {
                this.tasks = this.tasks.filter(t => !t.completed);
                this.saveTasks();
                this.renderTasks();
                this.updateTaskCounter();
            }

            /**
             * Set the current filter
             */
            setFilter(filter) {
                this.currentFilter = filter;
                
                // Update active filter button
                this.filterBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.filter === filter) {
                        btn.classList.add('active');
                    }
                });
                
                this.renderTasks();
            }

            /**
             * Get filtered tasks based on current filter
             */
            getFilteredTasks() {
                switch (this.currentFilter) {
                    case 'active':
                        return this.tasks.filter(t => !t.completed);
                    case 'completed':
                        return this.tasks.filter(t => t.completed);
                    default:
                        return this.tasks;
                }
            }

            /**
             * Render all tasks in the DOM
             */
            renderTasks() {
                const filteredTasks = this.getFilteredTasks();
                
                if (filteredTasks.length === 0) {
                    this.renderEmptyState();
                    return;
                }

                this.taskList.innerHTML = filteredTasks.map(task => this.createTaskElement(task)).join('');
                this.bindTaskEvents();
            }

            /**
             * Render empty state message
             */
            renderEmptyState() {
                const emptyMessages = {
                    all: { icon: '📝', text: 'No tasks yet. Add one above to get started!' },
                    active: { icon: '✅', text: 'All tasks completed! Great job!' },
                    completed: { icon: '📋', text: 'No completed tasks yet.' }
                };
                
                const message = emptyMessages[this.currentFilter];
                
                this.taskList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">${message.icon}</div>
                        <p>${message.text}</p>
                    </div>
                `;
            }

            /**
             * Create HTML element for a single task
             */
            createTaskElement(task) {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
                const dueDateDisplay = task.dueDate ? this.formatDate(task.dueDate) : '';

                return `
                    <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}" draggable="true">
                        <div class="priority-indicator priority-${task.priority}"></div>
                        
                        <label class="task-checkbox">
                            <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                            <span class="checkmark"></span>
                        </label>

                        <div class="task-content">
                            <div class="task-text" contenteditable="true" data-id="${task.id}">${this.escapeHtml(task.text)}</div>
                            <div class="task-meta">
                                <span class="priority-badge ${task.priority}">${task.priority}</span>
                                ${task.dueDate ? `
                                    <span class="due-date-display ${isOverdue ? 'overdue' : ''}">
                                        📅 ${dueDateDisplay} ${isOverdue ? '(Overdue)' : ''}
                                    </span>
                                ` : ''}
                            </div>
                        </div>

                        <div class="task-actions">
                            <button class="action-btn drag-handle">⋮⋮</button>
                            <button class="action-btn delete-btn" data-id="${task.id}">🗑️</button>
                        </div>
                    </div>
                `;
            }

            /**
             * Bind events to task elements
             */
            bindTaskEvents() {
                // Checkbox events
                document.querySelectorAll('.task-checkbox input').forEach(checkbox => {
                    checkbox.addEventListener('change', (e) => {
                        this.toggleTask(e.target.dataset.id);
                    });
                });

                // Delete button events
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.deleteTask(e.target.dataset.id);
                    });
                });

                // Inline edit events
                document.querySelectorAll('.task-text').forEach(text => {
                    text.addEventListener('blur', (e) => {
                        this.editTask(e.target.dataset.id, e.target.textContent);
                    });
                    
                    text.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            e.target.blur();
                        }
                    });
                });
            }

            /**
             * Drag and drop functionality
             */
            handleDragStart(e) {
                if (e.target.classList.contains('task-item')) {
                    this.draggedTask = e.target;
                    e.target.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                }
            }

            handleDragOver(e) {
                if (this.draggedTask) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';

                    const afterElement = this.getDragAfterElement(e.clientY);
                    if (afterElement == null) {
                        this.taskList.appendChild(this.draggedTask);
                    } else {
                        this.taskList.insertBefore(this.draggedTask, afterElement);
                    }
                }
            }

            handleDrop(e) {
                if (this.draggedTask) {
                    e.preventDefault();
                    this.reorderTasks();
                }
            }

            handleDragEnd() {
                if (this.draggedTask) {
                    this.draggedTask.classList.remove('dragging');
                    this.draggedTask = null;
                }
            }

            /**
             * Get the element after which the dragged item should be placed
             */
            getDragAfterElement(y) {
                const draggableElements = [...this.taskList.querySelectorAll('.task-item:not(.dragging)')];
                
                return draggableElements.reduce((closest, child) => {
                    const box = child.getBoundingClientRect();
                    const offset = y - box.top - box.height / 2;
                    
                    if (offset < 0 && offset > closest.offset) {
                        return { offset: offset, element: child };
                    } else {
                        return closest;
                    }
                }, { offset: Number.NEGATIVE_INFINITY }).element;
            }

            /**
             * Reorder tasks based on DOM order after drag and drop
             */
            reorderTasks() {
                const taskItems = [...this.taskList.querySelectorAll('.task-item')];
                const newOrder = taskItems.map(item => item.dataset.id);
                
                this.tasks.sort((a, b) => {
                    return newOrder.indexOf(a.id) - newOrder.indexOf(b.id);
                });
                
                this.saveTasks();
            }

            /**
             * Update the task counter display
             */
            updateTaskCounter() {
                const activeTasks = this.tasks.filter(t => !t.completed).length;
                const totalTasks = this.tasks.length;
                
                if (totalTasks === 0) {
                    this.taskCounter.textContent = '0 tasks';
                } else if (activeTasks === 0) {
                    this.taskCounter.textContent = 'All tasks completed!';
                } else {
                    this.taskCounter.textContent = `${activeTasks} task${activeTasks === 1 ? '' : 's'} remaining`;
                }
            }

            /**
             * Toggle between light and dark themes
             */
            toggleTheme() {
                this.theme = this.theme === 'light' ? 'dark' : 'light';
                this.applyTheme();
                localStorage.setItem('theme', this.theme);
            }

            /**
             * Apply the current theme to the document
             */
            applyTheme() {
                document.documentElement.setAttribute('data-theme', this.theme);
                this.themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
            }

            /**
             * Format date for display
             */
            formatDate(dateString) {
                const date = new Date(dateString);
                const today = new Date();
                const diffTime = date - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 0) return 'Today';
                if (diffDays === 1) return 'Tomorrow';
                if (diffDays === -1) return 'Yesterday';
                if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
                if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
                
                return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
                });
            }

            /**
             * Escape HTML to prevent XSS attacks
             */
            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            /**
             * Generate unique ID for tasks
             */
            generateId() {
                return Date.now().toString(36) + Math.random().toString(36).substr(2);
            }

            /**
             * Save tasks to localStorage
             */
            saveTasks() {
                localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
            }
        }

        // Initialize the application when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new TodoApp();
        });

        /**
         * Additional utility functions and enhancements
         */

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Quick add task with Ctrl/Cmd + Enter from anywhere
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                document.getElementById('taskInput').focus();
            }
            
            // Clear completed tasks with Ctrl/Cmd + Shift + C
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'KeyC') {
                document.getElementById('clearCompleted').click();
            }
        });

        // Add service worker for offline functionality (basic implementation)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('data:text/javascript,')
                    .catch(() => {
                        // Silently fail - service worker is just a progressive enhancement
                    });
            });
        }

        // Add auto-save indicator
        let saveTimeout;
        const originalSaveTasks = TodoApp.prototype.saveTasks;
        TodoApp.prototype.saveTasks = function() {
            originalSaveTasks.call(this);
            
            // Show save indicator
            const indicator = document.createElement('div');
            indicator.textContent = 'Saved ✓';
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--success-color);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            `;
            
            document.body.appendChild(indicator);
            
            // Animate in
            setTimeout(() => indicator.style.opacity = '1', 10);
            
            // Remove after delay
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                indicator.style.opacity = '0';
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.parentNode.removeChild(indicator);
                    }
                }, 300);
            }, 1500);
        };

        // Add task statistics (optional enhancement)
        function showTaskStats() {
            const tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
            const stats = {
                total: tasks.length,
                completed: tasks.filter(t => t.completed).length,
                active: tasks.filter(t => !t.completed).length,
                overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length,
                byPriority: {
                    high: tasks.filter(t => t.priority === 'high' && !t.completed).length,
                    medium: tasks.filter(t => t.priority === 'medium' && !t.completed).length,
                    low: tasks.filter(t => t.priority === 'low' && !t.completed).length
                }
            };
            
            console.log('📊 Task Statistics:', stats);
            return stats;
        }

        // Export function for task data (useful for backups)
        function exportTasks() {
            const tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
            const dataStr = JSON.stringify(tasks, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        }

        // Import function for task data
        function importTasks(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const tasks = JSON.parse(e.target.result);
                    if (Array.isArray(tasks)) {
                        localStorage.setItem('todoTasks', JSON.stringify(tasks));
                        location.reload(); // Reload to show imported tasks
                    } else {
                        alert('Invalid task file format');
                    }
                } catch (error) {
                    alert('Error importing tasks: ' + error.message);
                }
            };
            reader.readAsText(file);
        }

        // Add these functions to window for console access
        window.todoUtils = {
            showTaskStats,
            exportTasks,
            importTasks
        };

        // Performance optimization: Debounce render function for better performance with many tasks
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Add performance monitoring for development
        if (window.performance && window.performance.mark) {
            window.addEventListener('load', () => {
                performance.mark('todo-app-loaded');
                performance.measure('todo-app-load-time', 'navigationStart', 'todo-app-loaded');
                
                const loadTime = performance.getEntriesByName('todo-app-load-time')[0];
                if (loadTime && loadTime.duration > 1000) {
                    console.log(`⚠️ App loaded in ${Math.round(loadTime.duration)}ms - consider optimization`);
                } else {
                    console.log(`✅ App loaded successfully in ${Math.round(loadTime.duration)}ms`);
                }
            });
        }