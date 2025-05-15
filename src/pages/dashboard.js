import { useState, useEffect } from 'react';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const prisma = new PrismaClient();

export default function Dashboard({ user, tasks: initialTasks }) {
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState(initialTasks);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});
  const [isToggling, setIsToggling] = useState({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    password: '',
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) {
      router.push('/login');
    }
  }, [user, router]);

  const getInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (!confirmLogout) return;

    try {
      // Call the logout API (if any)
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Clear the token cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim() === '') {
      setError('Task cannot be empty');
      return;
    }
    
    setIsAdding(true);
    setError(null);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask,
          userId: user.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to add task');

      const addedTask = await response.json();
      setTasks([addedTask, ...tasks]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveTask = async (taskId) => {
    setIsDeleting({ ...isDeleting, [taskId]: true });
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.message);
    } finally {
      setIsDeleting({ ...isDeleting, [taskId]: false });
    }
  };

  const handleToggleComplete = async (taskId) => {
    setIsToggling({ ...isToggling, [taskId]: true });
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !taskToUpdate.completed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.message);
    } finally {
      setIsToggling({ ...isToggling, [taskId]: false });
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <>
      <Head>
        <title>Dashboard | Task Manager</title>
        <meta name="description" content="Your personal task management dashboard" />
        <meta name="theme-color" content="#0a0a23" />
      
      </Head>
      
      <div className="min-h-screen bg-[#9191e1] p-4 md:p-8 overflow-hidden relative">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header with Profile and Add Task */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Profile Card */}
            <div className="w-full md:w-1/2 bg-[rgba(42,42,53,0.7)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.15)] shadow-2xl overflow-hidden relative transition-all duration-500 hover:border-[rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(230,230,250,0.15)]">
              <div className="bg-gradient-to-r from-blue-500 to-blue-590 h-24 relative">
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="absolute top-2 right-2 p-2 bg-[rgba(220,220,225,0.15)] rounded-full border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(230,230,250,0.25)] transition-all"
                  title="Logout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#e6e6fa]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
              <div className="px-6 pb-6 relative">
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="h-24 w-24 rounded-full bg-blue-450 border-4 border-blue-500 flex items-center justify-center text-3xl font-bold text-[#e6e6fa] shadow-md overflow-hidden">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-[#e6e6fa]">{user.name}</h2>
                  <p className="text-[#d3d3d3]/80">{user.email}</p>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                  <div className="bg-[rgba(230,230,250,0.1)] p-3 rounded-lg backdrop-blur-md">
                    <p className="text-2xl font-bold text-[#b0c4de]">{tasks.length}</p>
                    <p className="text-sm text-[#d3d3d3]/80">Total Tasks</p>
                  </div>
                  <div className="bg-[rgba(230,230,250,0.1)] p-3 rounded-lg backdrop-blur-md">
                    <p className="text-2xl font-bold text-green-400">{completedTasks}</p>
                    <p className="text-sm text-[#d3d3d3]/80">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Task Section */}
            <div className="w-full md:w-1/2 bg-[rgba(47,47,53,0.7)] backdrop-blur-xl rounded-2xl border border-[rgba(77,72,72,0.15)] shadow-2xl p-6 flex flex-col justify-center transition-all duration-500 hover:border-[rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(230,230,250,0.15)]">
              <h2 className="text-xl font-semibold text-[#e6e6fa] mb-4">Add New Task</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="What needs to be done today?"
                  className="flex-1 p-3 bg-[rgba(230,230,250,0.1)] border border-[rgba(255,255,255,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#e6e6fa] placeholder-[#d3d3d3]/60"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <button
                  onClick={handleAddTask}
                  disabled={isAdding}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-[#e6e6fa] rounded-lg hover:from-blue-700 hover:to-blue-500 disabled:opacity-50 transition-all"
                >
                  {isAdding ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#e6e6fa]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </span>
                  ) : 'Add Task'}
                </button>
              </div>
              {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
            </div>
          </div>

          {/* Task Management Section */}
          <div className=" bg-[rgba(62,62,69,0.7)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.15)] shadow-2xl overflow-hidden transition-all duration-500 hover:border-[rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(230,230,250,0.15)]">
            {/* Task Input */}
            
                 
           

            {/* Tasks List */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#e6e6fa]">Your Tasks</h2>
                <span className="text-sm text-[#d3d3d3]/80">
                  {pendingTasks} pending • {completedTasks} completed
                </span>
              </div>
              
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 text-[#d3d3d3]/60 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-[#e6e6fa]">No tasks yet</h3>
                  <p className="text-[#d3d3d3]/80 mt-1">Add your first task to get started</p>
                </div>
              ) : (
                <ul className="divide-y divide-[rgba(255,255,255,0.1)]">
                  {tasks.map((task) => (
                    <li 
                      key={task.id} 
                      className="py-4 hover:bg-[rgba(230,230,250,0.05)] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <button
                            onClick={() => handleToggleComplete(task.id)}
                            disabled={isToggling[task.id]}
                            className={`flex-shrink-0 h-5 w-5 rounded-full border border-[rgba(255,255,255,0.2)] mr-3 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500/20 border-green-400/50' : 'bg-[rgba(230,230,250,0.1)]'}`}
                          >
                            {task.completed && (
                              <svg className="h-3 w-3 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                          <p className={`text-sm font-medium truncate ${task.completed ? 'text-[#d3d3d3]/60 line-through' : 'text-[#e6e6fa]'}`}>
                            {task.title}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-[#d3d3d3]/80">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleRemoveTask(task.id)}
                            disabled={isDeleting[task.id]}
                            className="p-1 text-[#d3d3d3]/60 hover:text-red-400 disabled:text-[#d3d3d3]/30 transition-colors"
                            title="Delete task"
                          >
                            {isDeleting[task.id] ? (
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleLogout}
            className="p-2 bg-[rgba(220,220,225,0.15)] rounded-full border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(230,230,250,0.25)] transition-all"
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#0d0d0d]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>

     
    </>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.token || null;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true
      }
    });

    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return {
      props: {
        user,
        tasks: JSON.parse(JSON.stringify(tasks))
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
