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

  const handleImportSf10 = useCallback(
    async (file, options = {}) => {
      const token = await getToken();
      const formData = new FormData();
      formData.append('file', file);
      if (options.sectionId) {
        formData.append('sectionId', options.sectionId);
      }

      const uploadData = await showPromiseToast((async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/sf10/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          const error = new Error(data?.error || 'Failed to upload SF10 file.');
          error.status = res.status;
          error.code = data?.code || null;
          error.details = data;
          throw error;
        }

        await fetchSections();
        return data;
      })(), {
        loading: { title: options.sectionId ? 'Uploading SF10 to selected folder...' : 'Uploading SF10 file...' },
        success: { title: 'SF10 uploaded successfully.' },
        error: (err) => {
          if (err?.status === 422 && err?.code === 'SF10_DETECTION_FAILED') {
            return { title: 'Auto-detect failed. Choose a folder.' };
          }

          return { title: err?.message || 'SF10 upload failed.' };
        },
      });

      return uploadData;
    },
    [fetchSections, getToken]
  );

  const handleGetSf10Files = useCallback(
    async (sectionId) => {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/sf10/files?sectionId=${encodeURIComponent(sectionId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to list SF10 files.');
      return data;
    },
    [getToken],
  );

  const handleGetSf10SignedUrl = useCallback(
    async (path) => {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/sf10/signed-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ path, expiresIn: 120 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to generate signed URL.');
      return data;
    },
    [getToken],
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
    handleImportSf10,
    handleGetSf10Files,
    handleGetSf10SignedUrl,
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
