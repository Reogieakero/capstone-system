'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';
import { ADMIN_PAGE_TITLES } from '../../constants/admin.constants';
import { 
  showPromiseToast, 
  showSuccessToast, 
  showErrorToast 
} from '../utils/sileoNotify'; //

const ADMIN_ACTIVE_PAGE_KEY = 'admin_active_page';

function getInitialAdminPage() {
  if (typeof window === 'undefined') return 'overview';

  const savedPage = window.sessionStorage.getItem(ADMIN_ACTIVE_PAGE_KEY);
  if (!savedPage) return 'overview';

  return Object.prototype.hasOwnProperty.call(ADMIN_PAGE_TITLES, savedPage)
    ? savedPage
    : 'overview';
}

export default function useAdminDashboard() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] = useState(getInitialAdminPage);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [sections, setSections] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [userFilter, setUserFilter] = useState('all');

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }, []);

  const fetchStats = useCallback(async () => {
    setPageLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } finally {
      setPageLoading(false);
    }
  }, [getToken]);

  const fetchUsers = useCallback(async () => {
    setPageLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } finally {
      setPageLoading(false);
    }
  }, [getToken]);

  const fetchSections = useCallback(async () => {
    setPageLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/sections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSections(data.sections || []);
      }
    } finally {
      setPageLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: prof } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('id', user.id)
        .single();

      if (!prof || !['admin', 'principal'].includes(prof.role)) {
        router.replace('/');
        return;
      }

      setProfile(prof);
      setLoading(false);
    }

    init();
  }, [router]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (activePage === 'overview') {
      fetchStats();
    }

    if (activePage === 'users') {
      fetchUsers();
    }

    if (activePage === 'sections') {
      fetchUsers();
      fetchSections();
    }

    if (activePage === 'storage') {
      fetchSections();
    }
  }, [activePage, fetchSections, fetchStats, fetchUsers, loading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(ADMIN_ACTIVE_PAGE_KEY, activePage);
  }, [activePage]);

  const handleApprove = useCallback(
    async (userId, userName) => {
      try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/approve-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, action: 'approve' }),
      });

      if (!res.ok) throw new Error('Failed to approve user');

      showSuccessToast({
        title: 'User Approved',
        description: `${userName} now has access to the system.`,
      });

      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (error) {
      showErrorToast({
        title: 'Approval Error',
        description: error.message,
      });
    }
  },
    [fetchStats, fetchUsers, getToken]
  );

  const handleReject = useCallback(
    async (userId, userName) => {
      try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/approve-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, action: 'reject' }),
      });

      if (!res.ok) throw new Error('Failed to reject user');

      showWarningToast({
        title: 'User Rejected',
        description: `${userName}'s application has been moved to the rejected list.`,
      });

      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (error) {
      showErrorToast({
        title: 'Rejection Error',
        description: error.message,
      });
    }
  },
    [fetchStats, fetchUsers, getToken]
  );

  const handleDeleteUser = useCallback(
    async (userId, confirmationUserId) => {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, confirmationUserId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to delete user.');
      }

      await Promise.all([fetchUsers(), fetchStats()]);
      return data;
    },
    [fetchUsers, fetchStats, getToken]
  );

  const handleCreateSection = useCallback(
    async (sectionPayload) => {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sectionPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create section.');
      }

      await fetchSections();
      return data;
    },
    [fetchSections, getToken]
  );

  const refreshUsersPage = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  const refreshSectionsPage = useCallback(async () => {
    await Promise.all([fetchUsers(), fetchSections()]);
  }, [fetchSections, fetchUsers]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  }, [router]);

  const filteredUsers = users.filter((user) => (
    userFilter === 'all' ? true : user.status === userFilter
  ));

  const userStatusCounts = users.reduce(
    (counts, user) => {
      counts[user.status] = (counts[user.status] || 0) + 1;
      return counts;
    },
    { pending: 0, approved: 0, rejected: 0 }
  );

  return {
    activePage,
    collapsed,
    filteredUsers,
    handleApprove,
    handleReject,
    handleDeleteUser,
    handleCreateSection,
    handleSignOut,
    refreshSectionsPage,
    refreshUsersPage,
    loading,
    pageLoading,
    pageTitle: ADMIN_PAGE_TITLES[activePage],
    profile,
    users,
    sections,
    setActivePage,
    setCollapsed,
    setUserFilter,
    stats,
    userFilter,
    userStatusCounts,
  };
}
