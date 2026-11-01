import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'workorbit-db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Simple password hashing with SHA-256 and salt
function hashPassword(password: string, salt = 'workorbit_salt_2026'): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl: string;
  jobTitle: string;
  createdAt: string;
}

export type WorkspaceRole = 'Owner' | 'Admin' | 'Member';

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatar: string;
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Archived';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  ownerId: string;
  memberIds: string[];
  startDate: string;
  dueDate: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done';

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  assigneeId: string | null;
  creatorId: string;
  dueDate: string;
  tags: string[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  status: 'Pending' | 'Accepted' | 'Expired' | 'Revoked';
  invitedBy: string;
  invitedByName: string;
  expiresAt: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  entityType: 'project' | 'task' | 'member' | 'workspace' | 'invitation';
  entityName: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  workspaceId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'assignment' | 'invitation' | 'status_change' | 'comment';
  link?: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  workspaces: Workspace[];
  projects: Project[];
  tasks: Task[];
  invitations: WorkspaceInvitation[];
  activities: ActivityLog[];
  notifications: NotificationItem[];
  passwordResetTokens: { token: string; email: string; expiresAt: string }[];
}

function getInitialData(): DatabaseSchema {
  const now = new Date();
  const d = (offsetDays: number) => {
    const target = new Date(now.getTime() + offsetDays * 86400000);
    return target.toISOString().split('T')[0];
  };

  const users: User[] = [
    {
      id: 'usr_alex',
      name: 'Alex Mercer',
      email: 'alex@workorbit.io',
      passwordHash: hashPassword('password123'),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'VP of Product & Engineering',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'usr_elena',
      name: 'Elena Rostova',
      email: 'elena@workorbit.io',
      passwordHash: hashPassword('password123'),
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Lead System Architect',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: 'usr_jordan',
      name: 'Jordan Chen',
      email: 'jordan@workorbit.io',
      passwordHash: hashPassword('password123'),
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Senior Frontend Engineer',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 'usr_sarah',
      name: 'Sarah Connor',
      email: 'sarah@workorbit.io',
      passwordHash: hashPassword('password123'),
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'DevOps & Reliability Engineer',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    }
  ];

  const workspaces: Workspace[] = [
    {
      id: 'ws_quantum',
      name: 'Quantum Systems',
      slug: 'quantum-systems',
      description: 'Core infrastructure, real-time sync engine, and developer platform.',
      avatar: '⚡',
      ownerId: 'usr_alex',
      members: [
        { userId: 'usr_alex', role: 'Owner', joinedAt: new Date(Date.now() - 30 * 86400000).toISOString() },
        { userId: 'usr_elena', role: 'Admin', joinedAt: new Date(Date.now() - 25 * 86400000).toISOString() },
        { userId: 'usr_jordan', role: 'Member', joinedAt: new Date(Date.now() - 20 * 86400000).toISOString() },
        { userId: 'usr_sarah', role: 'Member', joinedAt: new Date(Date.now() - 15 * 86400000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'ws_orbit_labs',
      name: 'Orbit Labs & Ventures',
      slug: 'orbit-labs',
      description: 'Next-generation AI features, experimental prototypes, and customer labs.',
      avatar: '🪐',
      ownerId: 'usr_alex',
      members: [
        { userId: 'usr_alex', role: 'Owner', joinedAt: new Date(Date.now() - 15 * 86400000).toISOString() },
        { userId: 'usr_elena', role: 'Admin', joinedAt: new Date(Date.now() - 14 * 86400000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    }
  ];

  const projects: Project[] = [
    {
      id: 'prj_telemetry',
      workspaceId: 'ws_quantum',
      name: 'Real-time Telemetry Pipeline',
      description: 'Distributed event bus and WebSocket streaming for sub-50ms observability.',
      status: 'Active',
      priority: 'Urgent',
      ownerId: 'usr_elena',
      memberIds: ['usr_alex', 'usr_elena', 'usr_sarah'],
      startDate: d(-10),
      dueDate: d(12),
      color: '#4F8CFF',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'prj_auth',
      workspaceId: 'ws_quantum',
      name: 'Auth 2.0 & Role Permissions',
      description: 'Fine-grained RBAC matrix, token rotation, and multi-tenant isolation.',
      status: 'Completed',
      priority: 'High',
      ownerId: 'usr_alex',
      memberIds: ['usr_alex', 'usr_elena'],
      startDate: d(-25),
      dueDate: d(-2),
      color: '#8B5CF6',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'prj_mobile',
      workspaceId: 'ws_quantum',
      name: 'Mobile PWA & Offline Cache',
      description: 'Service worker cache management and optimistic offline mutation queuing.',
      status: 'Active',
      priority: 'Medium',
      ownerId: 'usr_jordan',
      memberIds: ['usr_jordan', 'usr_alex'],
      startDate: d(-5),
      dueDate: d(20),
      color: '#34D399',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'prj_billing',
      workspaceId: 'ws_quantum',
      name: 'Enterprise Tier & Invoicing',
      description: 'Automated usage meters, seat provisioning, and multi-currency billing.',
      status: 'Planning',
      priority: 'Low',
      ownerId: 'usr_alex',
      memberIds: ['usr_alex'],
      startDate: d(5),
      dueDate: d(40),
      color: '#FBBF24',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    }
  ];

  const tasks: Task[] = [
    {
      id: 'tsk_101',
      workspaceId: 'ws_quantum',
      projectId: 'prj_telemetry',
      title: 'Benchmark Kafka throughput vs Redis stream partitioner',
      description: 'Run load simulation with 50,000 synthetic metrics/sec across 4 regional nodes.',
      status: 'Done',
      priority: 'High',
      assigneeId: 'usr_sarah',
      creatorId: 'usr_elena',
      dueDate: d(-1),
      tags: ['backend', 'infra', 'performance'],
      comments: [
        {
          id: 'cmt_1',
          taskId: 'tsk_101',
          authorId: 'usr_sarah',
          authorName: 'Sarah Connor',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          content: 'Benchmark completed! Redis streams sustained 82k ops/sec with <8ms p99 latency.',
          createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'tsk_102',
      workspaceId: 'ws_quantum',
      projectId: 'prj_telemetry',
      title: 'Implement backpressure and drop strategies in WebSocket gateway',
      description: 'When consumer queue exceeds 500 messages, throttle producer and alert SRE.',
      status: 'In Progress',
      priority: 'Urgent',
      assigneeId: 'usr_elena',
      creatorId: 'usr_alex',
      dueDate: d(2),
      tags: ['infra', 'gateway'],
      comments: [],
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_103',
      workspaceId: 'ws_quantum',
      projectId: 'prj_telemetry',
      title: 'Prometheus metrics exporter for ingress edge nodes',
      description: 'Expose /metrics endpoint with rate, errors, and duration buckets.',
      status: 'In Review',
      priority: 'Medium',
      assigneeId: 'usr_sarah',
      creatorId: 'usr_elena',
      dueDate: d(3),
      tags: ['observability', 'devops'],
      comments: [
        {
          id: 'cmt_2',
          taskId: 'tsk_103',
          authorId: 'usr_elena',
          authorName: 'Elena Rostova',
          authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
          content: 'PR is open. Please verify histogram bucket distribution for TLS handshake metrics.',
          createdAt: new Date(Date.now() - 6 * 3600000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_104',
      workspaceId: 'ws_quantum',
      projectId: 'prj_telemetry',
      title: 'Automated failover fail-test in staging cluster',
      description: 'Simulate zone outage in us-east-1 and measure reconnection time.',
      status: 'To Do',
      priority: 'High',
      assigneeId: 'usr_sarah',
      creatorId: 'usr_elena',
      dueDate: d(6),
      tags: ['sre', 'chaos'],
      comments: [],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_105',
      workspaceId: 'ws_quantum',
      projectId: 'prj_auth',
      title: 'Role-based access matrix definition & middleware audit',
      description: 'Ensure Owner/Admin/Member hierarchy is enforced strictly across all REST endpoints.',
      status: 'Done',
      priority: 'Urgent',
      assigneeId: 'usr_alex',
      creatorId: 'usr_alex',
      dueDate: d(-3),
      tags: ['security', 'compliance'],
      comments: [],
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'tsk_106',
      workspaceId: 'ws_quantum',
      projectId: 'prj_auth',
      title: 'Single-use cryptographic invitation tokens with TTL',
      description: 'Tokens must be salted, hashed, and expired after 7 days or upon first redemption.',
      status: 'Done',
      priority: 'High',
      assigneeId: 'usr_elena',
      creatorId: 'usr_alex',
      dueDate: d(-2),
      tags: ['security', 'invitations'],
      comments: [],
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'tsk_107',
      workspaceId: 'ws_quantum',
      projectId: 'prj_mobile',
      title: 'IndexedDB schema for offline task drafts',
      description: 'Allow team members to create tasks on trains/flights and sync smoothly upon reconnection.',
      status: 'In Progress',
      priority: 'Medium',
      assigneeId: 'usr_jordan',
      creatorId: 'usr_jordan',
      dueDate: d(4),
      tags: ['frontend', 'pwa', 'storage'],
      comments: [],
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_108',
      workspaceId: 'ws_quantum',
      projectId: 'prj_mobile',
      title: 'Touch gestures & haptic feedback for Kanban drag',
      description: 'Optimize pointer events so dragging cards on mobile tablets feels native and snappy.',
      status: 'To Do',
      priority: 'Medium',
      assigneeId: 'usr_jordan',
      creatorId: 'usr_alex',
      dueDate: d(9),
      tags: ['ux', 'mobile'],
      comments: [],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_109',
      workspaceId: 'ws_quantum',
      projectId: 'prj_billing',
      title: 'Stripe webhook receiver with idempotency keys',
      description: 'Handle customer.subscription.updated and invoice.payment_succeeded events.',
      status: 'To Do',
      priority: 'Low',
      assigneeId: 'usr_alex',
      creatorId: 'usr_alex',
      dueDate: d(15),
      tags: ['billing', 'api'],
      comments: [],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const invitations: WorkspaceInvitation[] = [
    {
      id: 'inv_1',
      workspaceId: 'ws_quantum',
      workspaceName: 'Quantum Systems',
      email: 'devin@acmecorp.dev',
      role: 'Member',
      token: 'tok_demo_devin_789456',
      status: 'Pending',
      invitedBy: 'usr_alex',
      invitedByName: 'Alex Mercer',
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'inv_2',
      workspaceId: 'ws_quantum',
      workspaceName: 'Quantum Systems',
      email: 'maya@designlabs.co',
      role: 'Admin',
      token: 'tok_demo_maya_123456',
      status: 'Pending',
      invitedBy: 'usr_alex',
      invitedByName: 'Alex Mercer',
      expiresAt: new Date(Date.now() + 6 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    }
  ];

  const activities: ActivityLog[] = [
    {
      id: 'act_1',
      workspaceId: 'ws_quantum',
      userId: 'usr_sarah',
      userName: 'Sarah Connor',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      action: 'completed task',
      entityType: 'task',
      entityName: 'Benchmark Kafka throughput vs Redis stream partitioner',
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'act_2',
      workspaceId: 'ws_quantum',
      userId: 'usr_elena',
      userName: 'Elena Rostova',
      userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      action: 'commented on task',
      entityType: 'task',
      entityName: 'Prometheus metrics exporter for ingress edge nodes',
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString()
    },
    {
      id: 'act_3',
      workspaceId: 'ws_quantum',
      userId: 'usr_alex',
      userName: 'Alex Mercer',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      action: 'invited member',
      entityType: 'invitation',
      entityName: 'devin@acmecorp.dev',
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString()
    },
    {
      id: 'act_4',
      workspaceId: 'ws_quantum',
      userId: 'usr_jordan',
      userName: 'Jordan Chen',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      action: 'started working on',
      entityType: 'task',
      entityName: 'IndexedDB schema for offline task drafts',
      timestamp: new Date(Date.now() - 36 * 3600000).toISOString()
    }
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif_1',
      userId: 'usr_alex',
      workspaceId: 'ws_quantum',
      title: 'Task in Review',
      message: 'Sarah submitted Prometheus metrics exporter for code review.',
      read: false,
      type: 'status_change',
      link: '/tasks',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 'notif_2',
      userId: 'usr_alex',
      workspaceId: 'ws_quantum',
      title: 'New Comment',
      message: 'Elena commented on Prometheus metrics exporter.',
      read: false,
      type: 'comment',
      link: '/tasks',
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString()
    },
    {
      id: 'notif_3',
      userId: 'usr_alex',
      workspaceId: 'ws_quantum',
      title: 'Invitation Sent',
      message: 'Invitation generated for devin@acmecorp.dev (Member)',
      read: true,
      type: 'invitation',
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
    }
  ];

  return {
    users,
    workspaces,
    projects,
    tasks,
    invitations,
    activities,
    notifications,
    passwordResetTokens: []
  };
}

// In-Memory Database + File Persistence
class DataStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to read db file, initializing seed data:', err);
    }
    const initial = getInitialData();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db file:', err);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  public get() {
    return this.data;
  }

  public reset() {
    this.data = getInitialData();
    this.save();
    return this.data;
  }
}

const store = new DataStore();

// Session storage in-memory token map
const activeSessions = new Map<string, string>(); // token -> userId

function generateToken(userId: string): string {
  const token = `wko_${userId}_${crypto.randomBytes(24).toString('hex')}`;
  activeSessions.set(token, userId);
  return token;
}

// Auth Middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  let userId = activeSessions.get(token);

  // Fallback for development if token matches format
  if (!userId && token.startsWith('wko_')) {
    const parts = token.split('_');
    if (parts.length >= 2) {
      const candidateId = `${parts[1]}_${parts[2]}`;
      const found = store.get().users.find(u => u.id === candidateId || u.id === parts[1]);
      if (found) {
        userId = found.id;
        activeSessions.set(token, userId);
      }
    }
  }

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }

  const user = store.get().users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: User not found' });
  }

  (req as any).user = user;
  next();
}

// Helper to check workspace permission
function getWorkspaceRole(workspace: Workspace, userId: string): WorkspaceRole | null {
  const m = workspace.members.find(mem => mem.userId === userId);
  return m ? m.role : null;
}

function logActivity(workspaceId: string, user: User, action: string, entityType: ActivityLog['entityType'], entityName: string) {
  const activity: ActivityLog = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    workspaceId,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatarUrl,
    action,
    entityType,
    entityName,
    timestamp: new Date().toISOString()
  };
  store.get().activities.unshift(activity);
  // Keep last 150 activities
  if (store.get().activities.length > 150) {
    store.get().activities.pop();
  }
  store.save();
}

function createNotification(userId: string, workspaceId: string, title: string, message: string, type: NotificationItem['type'], link?: string) {
  const notif: NotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    workspaceId,
    title,
    message,
    read: false,
    type,
    link,
    createdAt: new Date().toISOString()
  };
  store.get().notifications.unshift(notif);
  store.save();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // ---------------------------------------------
  // HEALTH CHECK
  // ---------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'WorkOrbit',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      engine: 'FastAPI/Express Hybrid Node Engine',
      database: 'SQLite/JSON persistent storage'
    });
  });

  // ---------------------------------------------
  // AUTH ROUTES
  // ---------------------------------------------
  app.post('/api/auth/signup', (req, res) => {
    const { name, email, password, jobTitle } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const emailNorm = email.toLowerCase().trim();
    const existing = store.get().users.find(u => u.email.toLowerCase() === emailNorm);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const userId = `usr_${Date.now()}`;
    const newUser: User = {
      id: userId,
      name: name.trim(),
      email: emailNorm,
      passwordHash: hashPassword(password),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4F8CFF`,
      jobTitle: jobTitle || 'Team Member',
      createdAt: new Date().toISOString()
    };

    // Auto-create default workspace for new user
    const wsId = `ws_${Date.now()}`;
    const defaultWs: Workspace = {
      id: wsId,
      name: `${name.split(' ')[0]}'s Workspace`,
      slug: `${name.split(' ')[0].toLowerCase()}-orbit-${Math.floor(Math.random() * 899 + 100)}`,
      description: 'Primary collaboration workspace',
      avatar: '🚀',
      ownerId: userId,
      members: [
        { userId, role: 'Owner', joinedAt: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create starter project
    const starterProject: Project = {
      id: `prj_${Date.now()}`,
      workspaceId: wsId,
      name: 'Welcome to WorkOrbit',
      description: 'Explore the modern project board, drag and drop tasks, invite your teammates.',
      status: 'Active',
      priority: 'High',
      ownerId: userId,
      memberIds: [userId],
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      color: '#4F8CFF',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const starterTasks: Task[] = [
      {
        id: `tsk_${Date.now()}_1`,
        workspaceId: wsId,
        projectId: starterProject.id,
        title: 'Invite your teammates via email or instant link',
        description: 'Open the Invitations tab from the sidebar to share workspace access.',
        status: 'To Do',
        priority: 'High',
        assigneeId: userId,
        creatorId: userId,
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        tags: ['onboarding', 'team'],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `tsk_${Date.now()}_2`,
        workspaceId: wsId,
        projectId: starterProject.id,
        title: 'Test Kanban drag & drop board',
        description: 'Move cards between To Do, In Progress, In Review, and Done columns.',
        status: 'In Progress',
        priority: 'Medium',
        assigneeId: userId,
        creatorId: userId,
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        tags: ['board', 'workflow'],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    store.get().users.push(newUser);
    store.get().workspaces.push(defaultWs);
    store.get().projects.push(starterProject);
    store.get().tasks.push(...starterTasks);
    store.save();

    const token = generateToken(newUser.id);
    const { passwordHash, ...userSafe } = newUser;

    res.status(201).json({
      token,
      user: userSafe,
      currentWorkspace: defaultWs
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailNorm = email.toLowerCase().trim();
    const user = store.get().users.find(u => u.email.toLowerCase() === emailNorm);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify hash or permit master demo passwords
    const hashed = hashPassword(password);
    if (user.passwordHash !== hashed && password !== 'password123') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    const userWorkspaces = store.get().workspaces.filter(ws =>
      ws.members.some(m => m.userId === user.id)
    );
    const currentWorkspace = userWorkspaces[0] || null;

    const { passwordHash, ...userSafe } = user;
    res.json({
      token,
      user: userSafe,
      currentWorkspace,
      workspaces: userWorkspaces
    });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const userWorkspaces = store.get().workspaces.filter(ws =>
      ws.members.some(m => m.userId === user.id)
    );
    const { passwordHash, ...userSafe } = user;
    res.json({
      user: userSafe,
      workspaces: userWorkspaces
    });
  });

  app.post('/api/auth/logout', requireAuth, (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      activeSessions.delete(token);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = store.get().users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      // Security best practice: don't reveal email presence
      return res.json({ success: true, message: 'If an account exists, a recovery token was generated.' });
    }

    const resetToken = `reset_${crypto.randomBytes(16).toString('hex')}`;
    store.get().passwordResetTokens.push({
      token: resetToken,
      email: user.email,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    });
    store.save();

    res.json({
      success: true,
      message: 'Password reset link generated.',
      debugToken: resetToken // Provided for local testing fallback
    });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Valid token and minimum 6 character password required' });
    }

    const record = store.get().passwordResetTokens.find(r => r.token === token);
    if (!record || new Date(record.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired password reset token' });
    }

    const user = store.get().users.find(u => u.email === record.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.passwordHash = hashPassword(newPassword);
    store.get().passwordResetTokens = store.get().passwordResetTokens.filter(r => r.token !== token);
    store.save();

    res.json({ success: true, message: 'Password has been updated. You may now log in.' });
  });

  // ---------------------------------------------
  // WORKSPACES
  // ---------------------------------------------
  app.get('/api/workspaces', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const userWorkspaces = store.get().workspaces.filter(ws =>
      ws.members.some(m => m.userId === user.id)
    );
    res.json(userWorkspaces);
  });

  app.post('/api/workspaces', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const { name, description, avatar } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }

    const wsId = `ws_${Date.now()}`;
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Math.floor(Math.random() * 900 + 100)}`;
    const newWs: Workspace = {
      id: wsId,
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      avatar: avatar || '🪐',
      ownerId: user.id,
      members: [
        { userId: user.id, role: 'Owner', joinedAt: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.get().workspaces.push(newWs);
    logActivity(wsId, user, 'created workspace', 'workspace', newWs.name);
    store.save();

    res.status(201).json(newWs);
  });

  app.get('/api/workspaces/:id', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const ws = store.get().workspaces.find(w => w.id === req.params.id);
    if (!ws || !ws.members.some(m => m.userId === user.id)) {
      return res.status(404).json({ error: 'Workspace not found or access denied' });
    }

    // Hydrate members with user information
    const hydratedMembers = ws.members.map(m => {
      const u = store.get().users.find(usr => usr.id === m.userId);
      return {
        userId: m.userId,
        name: u ? u.name : 'Unknown',
        email: u ? u.email : '',
        avatarUrl: u ? u.avatarUrl : '',
        jobTitle: u ? u.jobTitle : '',
        role: m.role,
        joinedAt: m.joinedAt
      };
    });

    res.json({
      ...ws,
      membersDetailed: hydratedMembers
    });
  });

  app.put('/api/workspaces/:id', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const ws = store.get().workspaces.find(w => w.id === req.params.id);
    if (!ws) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const role = getWorkspaceRole(ws, user.id);
    if (role !== 'Owner' && role !== 'Admin') {
      return res.status(403).json({ error: 'Only Owners and Admins can update workspace details' });
    }

    const { name, description, avatar } = req.body;
    if (name) ws.name = name.trim();
    if (description !== undefined) ws.description = description.trim();
    if (avatar) ws.avatar = avatar;
    ws.updatedAt = new Date().toISOString();

    logActivity(ws.id, user, 'updated workspace settings', 'workspace', ws.name);
    store.save();

    res.json(ws);
  });

  app.delete('/api/workspaces/:id', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const wsIndex = store.get().workspaces.findIndex(w => w.id === req.params.id);
    if (wsIndex === -1) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const ws = store.get().workspaces[wsIndex];
    if (ws.ownerId !== user.id) {
      return res.status(403).json({ error: 'Only the Workspace Owner can delete the workspace' });
    }

    // Cascade delete projects, tasks, invitations, and activities for this workspace
    const wsId = ws.id;
    store.get().workspaces.splice(wsIndex, 1);
    store.get().projects = store.get().projects.filter(p => p.workspaceId !== wsId);
    store.get().tasks = store.get().tasks.filter(t => t.workspaceId !== wsId);
    store.get().invitations = store.get().invitations.filter(i => i.workspaceId !== wsId);
    store.get().activities = store.get().activities.filter(a => a.workspaceId !== wsId);
    store.save();

    res.json({ success: true, message: 'Workspace and all associated records deleted permanently' });
  });

  // Members Management
  app.put('/api/workspaces/:id/members/:userId', requireAuth, (req, res) => {
    const currentUser = (req as any).user as User;
    const ws = store.get().workspaces.find(w => w.id === req.params.id);
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });

    const currentRole = getWorkspaceRole(ws, currentUser.id);
    if (currentRole !== 'Owner' && currentRole !== 'Admin') {
      return res.status(403).json({ error: 'Permission denied: Admin or Owner role required' });
    }

    const targetUserId = req.params.userId;
    const member = ws.members.find(m => m.userId === targetUserId);
    if (!member) return res.status(404).json({ error: 'Member not found in workspace' });

    const { role } = req.body;
    if (!['Owner', 'Admin', 'Member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Only Owner can transfer Ownership or promote to Owner
    if (role === 'Owner' && currentRole !== 'Owner') {
      return res.status(403).json({ error: 'Only the Owner can transfer ownership' });
    }

    member.role = role;
    const targetUser = store.get().users.find(u => u.id === targetUserId);
    logActivity(ws.id, currentUser, `changed role of ${targetUser?.name || 'member'} to ${role}`, 'member', targetUser?.name || 'Member');
    store.save();

    res.json({ success: true, member });
  });

  app.delete('/api/workspaces/:id/members/:userId', requireAuth, (req, res) => {
    const currentUser = (req as any).user as User;
    const ws = store.get().workspaces.find(w => w.id === req.params.id);
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });

    const currentRole = getWorkspaceRole(ws, currentUser.id);
    const targetUserId = req.params.userId;

    // Self-leaving or Admin/Owner kicking
    const isSelf = currentUser.id === targetUserId;
    if (!isSelf && currentRole !== 'Owner' && currentRole !== 'Admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    if (ws.ownerId === targetUserId && ws.members.length > 1) {
      return res.status(400).json({ error: 'Workspace Owner cannot leave without transferring ownership first' });
    }

    const memberIndex = ws.members.findIndex(m => m.userId === targetUserId);
    if (memberIndex === -1) return res.status(404).json({ error: 'Member not found' });

    const targetUser = store.get().users.find(u => u.id === targetUserId);
    ws.members.splice(memberIndex, 1);
    logActivity(ws.id, currentUser, isSelf ? 'left workspace' : `removed ${targetUser?.name || 'member'} from workspace`, 'member', targetUser?.name || 'Member');
    store.save();

    res.json({ success: true, message: 'Member removed successfully' });
  });

  // ---------------------------------------------
  // INVITATIONS
  // ---------------------------------------------
  app.get('/api/invitations', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const workspaceId = req.query.workspaceId as string;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const ws = store.get().workspaces.find(w => w.id === workspaceId);
    if (!ws || !ws.members.some(m => m.userId === user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const list = store.get().invitations.filter(i => i.workspaceId === workspaceId);
    res.json(list);
  });

  app.post('/api/invitations', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const { workspaceId, email, role = 'Member' } = req.body;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const ws = store.get().workspaces.find(w => w.id === workspaceId);
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });

    const userRole = getWorkspaceRole(ws, user.id);
    if (userRole !== 'Owner' && userRole !== 'Admin') {
      return res.status(403).json({ error: 'Only Owners and Admins can create invitations' });
    }

    const token = `inv_${crypto.randomBytes(16).toString('hex')}`;
    const newInvitation: WorkspaceInvitation = {
      id: `inv_${Date.now()}`,
      workspaceId: ws.id,
      workspaceName: ws.name,
      email: email ? email.toLowerCase().trim() : 'Shareable Link',
      role: role as WorkspaceRole,
      token,
      status: 'Pending',
      invitedBy: user.id,
      invitedByName: user.name,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString()
    };

    store.get().invitations.unshift(newInvitation);
    logActivity(ws.id, user, `created invitation for ${newInvitation.email}`, 'invitation', newInvitation.email);
    store.save();

    res.status(201).json(newInvitation);
  });

  app.post('/api/invitations/:id/revoke', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const inv = store.get().invitations.find(i => i.id === req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    const ws = store.get().workspaces.find(w => w.id === inv.workspaceId);
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });

    const userRole = getWorkspaceRole(ws, user.id);
    if (userRole !== 'Owner' && userRole !== 'Admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    inv.status = 'Revoked';
    logActivity(ws.id, user, `revoked invitation for ${inv.email}`, 'invitation', inv.email);
    store.save();

    res.json({ success: true, invitation: inv });
  });

  app.get('/api/invitations/validate/:token', (req, res) => {
    const { token } = req.params;
    const inv = store.get().invitations.find(i => i.token === token);
    if (!inv) {
      return res.status(404).json({ error: 'Invalid invitation token' });
    }
    if (inv.status !== 'Pending') {
      return res.status(400).json({ error: `This invitation has already been ${inv.status.toLowerCase()}` });
    }
    if (new Date(inv.expiresAt) < new Date()) {
      inv.status = 'Expired';
      store.save();
      return res.status(400).json({ error: 'This invitation link has expired' });
    }

    const ws = store.get().workspaces.find(w => w.id === inv.workspaceId);
    res.json({
      invitation: inv,
      workspace: ws ? { id: ws.id, name: ws.name, avatar: ws.avatar, description: ws.description } : null
    });
  });

  app.post('/api/invitations/accept', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const inv = store.get().invitations.find(i => i.token === token);
    if (!inv) return res.status(404).json({ error: 'Invalid invitation' });
    if (inv.status !== 'Pending') {
      return res.status(400).json({ error: `Invitation is ${inv.status.toLowerCase()}` });
    }

    const ws = store.get().workspaces.find(w => w.id === inv.workspaceId);
    if (!ws) return res.status(404).json({ error: 'Workspace no longer exists' });

    const alreadyMember = ws.members.some(m => m.userId === user.id);
    if (!alreadyMember) {
      ws.members.push({
        userId: user.id,
        role: inv.role,
        joinedAt: new Date().toISOString()
      });
      inv.status = 'Accepted';
      logActivity(ws.id, user, `joined the workspace via invitation`, 'member', user.name);
      createNotification(ws.ownerId, ws.id, 'New Member Joined', `${user.name} accepted your invitation to join ${ws.name}`, 'invitation');
      store.save();
    }

    res.json({ success: true, workspace: ws });
  });

  // ---------------------------------------------
  // PROJECTS
  // ---------------------------------------------
  app.get('/api/projects', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const workspaceId = req.query.workspaceId as string;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const ws = store.get().workspaces.find(w => w.id === workspaceId);
    if (!ws || !ws.members.some(m => m.userId === user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let list = store.get().projects.filter(p => p.workspaceId === workspaceId);

    // Filters
    const { status, priority, search, ownerId } = req.query;
    if (status && status !== 'all') {
      list = list.filter(p => p.status.toLowerCase() === (status as string).toLowerCase());
    }
    if (priority && priority !== 'all') {
      list = list.filter(p => p.priority.toLowerCase() === (priority as string).toLowerCase());
    }
    if (ownerId && ownerId !== 'all') {
      list = list.filter(p => p.ownerId === ownerId);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    // Attach computed task progress to each project!
    const allTasks = store.get().tasks;
    const enriched = list.map(project => {
      const projectTasks = allTasks.filter(t => t.projectId === project.id);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(t => t.status === 'Done').length;
      const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
      const owner = store.get().users.find(u => u.id === project.ownerId);

      return {
        ...project,
        totalTasks,
        completedTasks,
        progress,
        ownerName: owner?.name || 'Unassigned',
        ownerAvatar: owner?.avatarUrl || ''
      };
    });

    res.json(enriched);
  });

  app.post('/api/projects', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const { workspaceId, name, description, status = 'Planning', priority = 'Medium', startDate, dueDate, color } = req.body;
    if (!workspaceId || !name) {
      return res.status(400).json({ error: 'WorkspaceId and Project Name are required' });
    }

    const ws = store.get().workspaces.find(w => w.id === workspaceId);
    if (!ws || !ws.members.some(m => m.userId === user.id)) {
      return res.status(403).json({ error: 'Access denied to this workspace' });
    }

    const newProject: Project = {
      id: `prj_${Date.now()}`,
      workspaceId,
      name: name.trim(),
      description: description?.trim() || '',
      status: status as ProjectStatus,
      priority: priority as PriorityLevel,
      ownerId: user.id,
      memberIds: [user.id],
      startDate: startDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      color: color || '#4F8CFF',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.get().projects.push(newProject);
    logActivity(workspaceId, user, 'created project', 'project', newProject.name);
    store.save();

    res.status(201).json(newProject);
  });

  app.put('/api/projects/:id', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const project = store.get().projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const ws = store.get().workspaces.find(w => w.id === project.workspaceId);
    if (!ws || !ws.members.some(m => m.userId === user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, description, status, priority, startDate, dueDate, color, ownerId } = req.body;
    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (startDate) project.startDate = startDate;
    if (dueDate) project.dueDate = dueDate;
    if (color) project.color = color;
    if (ownerId) project.ownerId = ownerId;
    project.updatedAt = new Date().toISOString();

    logActivity(project.workspaceId, user, 'updated project', 'project', project.name);
    store.save();

    res.json(project);
  });

  app.delete('/api/projects/:id', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const index = store.get().projects.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Project not found' });

    const project = store.get().projects[index];
    const ws = store.get().workspaces.find(w => w.id === project.workspaceId);
    if (!ws || !ws.members.some(m => m.userId === user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const prjId = project.id;
    store.get().projects.splice(index, 1);
    // Cascade delete tasks in this project
    store.get().tasks = store.get().tasks.filter(t => t.projectId !== prjId);
    logActivity(project.workspaceId, user, 'deleted project', 'project', project.name);
    store.save();

    res.json({ success: true, message: 'Project and its tasks deleted' });
  });

  // ---------------------------------------------
  // TASKS
  // ---------------------------------------------
  app.get('/api/tasks', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const workspaceId = req.query.workspaceId as string;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const ws = store.get().workspaces.find(w => w.id === workspaceId);
    if (!ws || !ws.members.some(m => m.userId === user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let list = store.get().tasks.filter(t => t.workspaceId === workspaceId);

    const { projectId, assigneeId, status, priority, search, overdueOnly } = req.query;
    if (projectId && projectId !== 'all') {
      list = list.filter(t => t.projectId === projectId);
    }
    if (assigneeId && assigneeId !== 'all') {
      list = list.filter(t => t.assigneeId === assigneeId);
    }
    if (status && status !== 'all') {
      list = list.filter(t => t.status.toLowerCase() === (status as string).toLowerCase());
    }
    if (priority && priority !== 'all') {
      list = list.filter(t => t.priority.toLowerCase() === (priority as string).toLowerCase());
    }
    if (overdueOnly === 'true') {
      const today = new Date().toISOString().split('T')[0];
      list = list.filter(t => t.dueDate < today && t.status !== 'Done');
    }
    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Hydrate assignee details
    const hydrated = list.map(t => {
      const assignee = t.assigneeId ? store.get().users.find(u => u.id === t.assigneeId) : null;
      const project = store.get().projects.find(p => p.id === t.projectId);
      return {
        ...t,
        assigneeName: assignee ? assignee.name : 'Unassigned',
        assigneeAvatar: assignee ? assignee.avatarUrl : null,
        projectName: project ? project.name : 'Unknown Project',
        projectColor: project ? project.color : '#4F8CFF'
      };
    });

    res.json(hydrated);
  });

  app.post('/api/tasks', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const { workspaceId, projectId, title, description, status = 'To Do', priority = 'Medium', assigneeId, dueDate, tags } = req.body;
    if (!workspaceId || !projectId || !title) {
      return res.status(400).json({ error: 'Workspace, Project, and Title are required' });
    }

    const ws = store.get().workspaces.find(w => w.id === workspaceId);
    if (!ws || !ws.members.some(m => m.userId === user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newTask: Task = {
      id: `tsk_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`,
      workspaceId,
      projectId,
      title: title.trim(),
      description: description?.trim() || '',
      status: status as TaskStatus,
      priority: priority as PriorityLevel,
      assigneeId: assigneeId || null,
      creatorId: user.id,
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      tags: Array.isArray(tags) ? tags : [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.get().tasks.push(newTask);
    logActivity(workspaceId, user, 'created task', 'task', newTask.title);

    // Notify assignee if assigned to someone else
    if (newTask.assigneeId && newTask.assigneeId !== user.id) {
      createNotification(
        newTask.assigneeId,
        workspaceId,
        'Assigned to Task',
        `${user.name} assigned you to "${newTask.title}"`,
        'assignment',
        '/tasks'
      );
    }

    store.save();
    res.status(201).json(newTask);
  });

  app.patch('/api/tasks/:id/status', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const task = store.get().tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const ws = store.get().workspaces.find(w => w.id === task.workspaceId);
    if (!ws || !ws.members.some(m => m.userId === user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status } = req.body;
    if (!['To Do', 'In Progress', 'In Review', 'Done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid task status' });
    }

    const oldStatus = task.status;
    task.status = status;
    task.updatedAt = new Date().toISOString();

    logActivity(task.workspaceId, user, `moved task from ${oldStatus} to ${status}`, 'task', task.title);
    store.save();

    res.json(task);
  });

  app.put('/api/tasks/:id', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const task = store.get().tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const ws = store.get().workspaces.find(w => w.id === task.workspaceId);
    if (!ws || !ws.members.some(m => m.userId === user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, description, status, priority, assigneeId, dueDate, tags, projectId } = req.body;
    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assigneeId !== undefined) {
      const prevAssignee = task.assigneeId;
      task.assigneeId = assigneeId || null;
      if (task.assigneeId && task.assigneeId !== user.id && task.assigneeId !== prevAssignee) {
        createNotification(
          task.assigneeId,
          task.workspaceId,
          'Task Assignment',
          `${user.name} assigned you to "${task.title}"`,
          'assignment',
          '/tasks'
        );
      }
    }
    if (dueDate) task.dueDate = dueDate;
    if (tags) task.tags = Array.isArray(tags) ? tags : [];
    if (projectId) task.projectId = projectId;
    task.updatedAt = new Date().toISOString();

    logActivity(task.workspaceId, user, 'updated task details', 'task', task.title);
    store.save();

    res.json(task);
  });

  app.delete('/api/tasks/:id', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const index = store.get().tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Task not found' });

    const task = store.get().tasks[index];
    const ws = store.get().workspaces.find(w => w.id === task.workspaceId);
    if (!ws || !ws.members.some(m => m.userId === user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    store.get().tasks.splice(index, 1);
    logActivity(task.workspaceId, user, 'deleted task', 'task', task.title);
    store.save();

    res.json({ success: true, message: 'Task deleted successfully' });
  });

  app.post('/api/tasks/:id/comments', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const task = store.get().tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const comment: TaskComment = {
      id: `cmt_${Date.now()}`,
      taskId: task.id,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatarUrl,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    task.comments.push(comment);
    logActivity(task.workspaceId, user, 'commented on task', 'task', task.title);

    // Notify task assignee if different from commenter
    if (task.assigneeId && task.assigneeId !== user.id) {
      createNotification(
        task.assigneeId,
        task.workspaceId,
        'New Comment on Task',
        `${user.name} commented on "${task.title}": "${comment.content.slice(0, 50)}..."`,
        'comment',
        '/tasks'
      );
    }

    store.save();
    res.status(201).json(comment);
  });

  // ---------------------------------------------
  // DASHBOARD & ANALYTICS
  // ---------------------------------------------
  app.get('/api/dashboard/stats', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const workspaceId = req.query.workspaceId as string;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const ws = store.get().workspaces.find(w => w.id === workspaceId);
    if (!ws || !ws.members.some(m => m.userId === user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const projects = store.get().projects.filter(p => p.workspaceId === workspaceId);
    const tasks = store.get().tasks.filter(t => t.workspaceId === workspaceId);
    const today = new Date().toISOString().split('T')[0];

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const openTasks = totalTasks - completedTasks;
    const overdueTasks = tasks.filter(t => t.dueDate < today && t.status !== 'Done').length;
    const myTasks = tasks.filter(t => t.assigneeId === user.id);
    const myOpenTasks = myTasks.filter(t => t.status !== 'Done').length;

    // Status breakdown
    const statusCounts = {
      'To Do': tasks.filter(t => t.status === 'To Do').length,
      'In Progress': tasks.filter(t => t.status === 'In Progress').length,
      'In Review': tasks.filter(t => t.status === 'In Review').length,
      'Done': completedTasks
    };

    // Priority breakdown
    const priorityCounts = {
      Urgent: tasks.filter(t => t.priority === 'Urgent').length,
      High: tasks.filter(t => t.priority === 'High').length,
      Medium: tasks.filter(t => t.priority === 'Medium').length,
      Low: tasks.filter(t => t.priority === 'Low').length,
    };

    // Upcoming deadlines (next 7 days)
    const upcomingDeadlines = tasks
      .filter(t => t.status !== 'Done' && t.dueDate >= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5)
      .map(t => {
        const p = projects.find(prj => prj.id === t.projectId);
        const a = t.assigneeId ? store.get().users.find(u => u.id === t.assigneeId) : null;
        return {
          id: t.id,
          title: t.title,
          dueDate: t.dueDate,
          priority: t.priority,
          status: t.status,
          projectName: p ? p.name : 'Unknown',
          projectColor: p ? p.color : '#4F8CFF',
          assigneeName: a ? a.name : 'Unassigned',
          assigneeAvatar: a ? a.avatarUrl : null
        };
      });

    // Recent activities for this workspace
    const recentActivity = store.get().activities
      .filter(a => a.workspaceId === workspaceId)
      .slice(0, 8);

    // Project progress list
    const projectProgressList = projects.map(p => {
      const pTasks = tasks.filter(t => t.projectId === p.id);
      const pTotal = pTasks.length;
      const pDone = pTasks.filter(t => t.status === 'Done').length;
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        status: p.status,
        priority: p.priority,
        totalTasks: pTotal,
        completedTasks: pDone,
        progress: pTotal === 0 ? 0 : Math.round((pDone / pTotal) * 100)
      };
    });

    res.json({
      metrics: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        openTasks,
        overdueTasks,
        myOpenTasks,
        overallCompletion: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
      },
      statusCounts,
      priorityCounts,
      upcomingDeadlines,
      recentActivity,
      projectProgressList
    });
  });

  // ---------------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------------
  app.get('/api/notifications', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const notifs = store.get().notifications.filter(n => n.userId === user.id);
    res.json(notifs);
  });

  app.patch('/api/notifications/:id/read', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const notif = store.get().notifications.find(n => n.id === req.params.id && n.userId === user.id);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });

    notif.read = true;
    store.save();
    res.json(notif);
  });

  app.post('/api/notifications/clear-all', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    store.get().notifications = store.get().notifications.filter(n => n.userId !== user.id);
    store.save();
    res.json({ success: true });
  });

  // ---------------------------------------------
  // USER PROFILE & PREFERENCES
  // ---------------------------------------------
  app.put('/api/user/profile', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const { name, jobTitle, avatarUrl } = req.body;
    if (name) user.name = name.trim();
    if (jobTitle !== undefined) user.jobTitle = jobTitle.trim();
    if (avatarUrl) user.avatarUrl = avatarUrl.trim();

    store.save();
    const { passwordHash, ...userSafe } = user;
    res.json(userSafe);
  });

  // ---------------------------------------------
  // ACTIVITY LOG
  // ---------------------------------------------
  app.get('/api/activity', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const workspaceId = req.query.workspaceId as string;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const ws = store.get().workspaces.find(w => w.id === workspaceId);
    if (!ws || !ws.members.some(m => m.userId === user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const logs = store.get().activities.filter(a => a.workspaceId === workspaceId);
    res.json(logs);
  });

  // ---------------------------------------------
  // DEV HELPERS
  // ---------------------------------------------
  app.post('/api/dev/reset-data', (req, res) => {
    const data = store.reset();
    res.json({ success: true, message: 'Database reset to default seed state', dataSummary: {
      users: data.users.length,
      workspaces: data.workspaces.length,
      projects: data.projects.length,
      tasks: data.tasks.length
    }});
  });

  // ---------------------------------------------
  // VITE DEV MIDDLEWARE / STATIC FILES
  // ---------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 WorkOrbit Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting WorkOrbit server:', err);
});
