import React, { useState, useEffect, useReducer } from 'react';
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSun, 
  FiMoon, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiCheck, 
  FiRotateCcw,
  FiTrash,
  FiArchive
} from 'react-icons/fi';

// Reducer para manejar estado global
const taskReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'EDIT_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload.id),
        deletedTasks: [...state.deletedTasks, action.payload],
      };
    case 'RESTORE_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        deletedTasks: state.deletedTasks.filter(task => task.id !== action.payload.id),
      };
    case 'PERMANENT_DELETE':
      return {
        ...state,
        deletedTasks: state.deletedTasks.filter(task => task.id !== action.payload),
      };
    case 'TOGGLE_COMPLETE':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload ? { ...task, completed: !task.completed } : task
        ),
      };
    case 'SET_TASKS':
      return action.payload;
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(taskReducer, { tasks: [], deletedTasks: [] });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editId, setEditId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Cargar tareas desde localStorage
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || { tasks: [], deletedTasks: [] };
    dispatch({ type: 'SET_TASKS', payload: savedTasks });
  }, []);

  // Guardar en localStorage cuando cambian las tareas
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(state));
  }, [state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editId) {
      dispatch({
        type: 'EDIT_TASK',
        payload: { id: editId, title, description, dueDate, completed: false },
      });
      setEditId(null);
    } else {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          id: Date.now(),
          title,
          description,
          dueDate,
          completed: false,
        },
      });
    }

    setTitle('');
    setDescription('');
    setDueDate('');
  };

  // Filtrar y buscar tareas
  const filteredTasks = state.tasks.filter(task => {
    const matchesFilter = filter === 'all' || 
      (filter === 'completed' && task.completed) || 
      (filter === 'pending' && !task.completed);
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <header className="header">
        <h1>Administrador de Tareas</h1>
        <div className="header-actions">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="theme-toggle"
            aria-label="Cambiar tema"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`trash-toggle ${showDeleted ? 'active' : ''}`}
            aria-label="Mostrar papelera"
          >
            <FiArchive />
            {state.deletedTasks.length > 0 && (
              <span className="trash-count">{state.deletedTasks.length}</span>
            )}
          </button>
        </div>
      </header>

      <div className="container">
        <aside className="sidebar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filters">
            <h3>Filtrar por:</h3>
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button
              className={filter === 'pending' ? 'active' : ''}
              onClick={() => setFilter('pending')}
            >
              Pendientes
            </button>
            <button
              className={filter === 'completed' ? 'active' : ''}
              onClick={() => setFilter('completed')}
            >
              Completadas
            </button>
          </div>
        </aside>

        <main className="main-content">
          {showDeleted ? (
            <div className="deleted-tasks">
              <div className="deleted-header">
                <h2>
                  <FiTrash /> Bandeja de borrados ({state.deletedTasks.length})
                </h2>
                <button
                  onClick={() => setShowDeleted(false)}
                  className="back-btn"
                >
                  Volver a tareas
                </button>
              </div>
              
              <AnimatePresence>
                {state.deletedTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="empty-message"
                  >
                    <FiArchive size={48} />
                    <p>No hay tareas eliminadas</p>
                  </motion.div>
                ) : (
                  state.deletedTasks.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="task deleted"
                    >
                      <div className="task-content">
                        <div className="task-header">
                          <h3>{task.title}</h3>
                          <span className="due-date">
                            {task.dueDate || 'Sin fecha'}
                          </span>
                        </div>
                        <p>{task.description}</p>
                      </div>
                      
                      <div className="task-actions">
                        <button
                          onClick={() => dispatch({ type: 'RESTORE_TASK', payload: task })}
                          className="restore-btn"
                          title="Restaurar tarea"
                        >
                          <FiRotateCcw />
                        </button>
                        <button
                          onClick={() => dispatch({ type: 'PERMANENT_DELETE', payload: task.id })}
                          className="permanent-delete-btn"
                          title="Eliminar permanentemente"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="task-form">
                <h2>{editId ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
                <input
                  type="text"
                  placeholder="Título"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Descripción"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="form-row">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                  <button type="submit" className="submit-btn">
                    <FiPlus /> {editId ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </form>

              <div className="task-list">
                <h2>Tareas ({filteredTasks.length})</h2>
                
                <AnimatePresence>
                  {filteredTasks.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="empty-message"
                    >
                      <FiCheck size={48} />
                      <p>No hay tareas {filter !== 'all' ? `(${filter === 'completed' ? 'completadas' : 'pendientes'})` : ''}</p>
                    </motion.div>
                  ) : (
                    filteredTasks.map(task => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className={`task ${task.completed ? 'completed' : ''}`}
                      >
                        <div className="task-content">
                          <div className="task-header">
                            <h3>{task.title}</h3>
                            <span className="due-date">
                              {task.dueDate || 'Sin fecha'}
                            </span>
                          </div>
                          <p>{task.description}</p>
                        </div>
                        
                        <div className="task-actions">
                          <button
                            onClick={() => dispatch({ type: 'TOGGLE_COMPLETE', payload: task.id })}
                            className={`complete-btn ${task.completed ? 'completed' : ''}`}
                            title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => {
                              setTitle(task.title);
                              setDescription(task.description);
                              setDueDate(task.dueDate);
                              setEditId(task.id);
                            }}
                            className="edit-btn"
                            title="Editar tarea"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => dispatch({ type: 'DELETE_TASK', payload: task })}
                            className="delete-btn"
                            title="Mover a la bandeja de borrados"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;