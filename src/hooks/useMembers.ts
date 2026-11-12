import { useState, useEffect, useMemo, useCallback } from 'react';
import { Member } from '../types';
import { initialMembers, DEFAULT_SEMESTERS } from '../data/initialData';
import { 
  subscribeToMembers, 
  saveMemberToFirestore, 
  deleteMemberFromFirestore 
} from '../lib/firebase';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('risor_jujutsu_members');
      return saved ? JSON.parse(saved) : initialMembers;
    } catch {
      return initialMembers;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync with Firestore in real-time
  useEffect(() => {
    let hasSeededMembers = false;
    const unsubscribe = subscribeToMembers((cloudMembers) => {
      setIsLoading(false);
      if (cloudMembers && cloudMembers.length > 0) {
        setMembers(cloudMembers);
      } else if (!hasSeededMembers && (!cloudMembers || cloudMembers.length === 0)) {
        hasSeededMembers = true;
        // Seed initial members into Firestore if collection is empty
        initialMembers.forEach((m) => {
          saveMemberToFirestore(m).catch(() => {});
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('risor_jujutsu_members', JSON.stringify(members));
    } catch (e) {
      console.warn('Could not save members to localStorage', e);
    }
  }, [members]);

  // Actions
  const addMember = useCallback(async (newMember: Member) => {
    setMembers((prev) => [newMember, ...prev.filter((m) => m.id !== newMember.id)]);
    await saveMemberToFirestore(newMember);
  }, []);

  const updateMember = useCallback(async (updatedMember: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
    await saveMemberToFirestore(updatedMember);
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    await deleteMemberFromFirestore(id);
  }, []);

  const toggleFee = useCallback(async (member: Member) => {
    const updatedMember: Member = {
      ...member,
      hasPaidFee: !member.hasPaidFee,
      paidDate: !member.hasPaidFee ? new Date().toISOString().slice(0, 10) : undefined,
      updatedAt: new Date().toISOString(),
    };
    setMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
    await saveMemberToFirestore(updatedMember);
  }, []);

  const resetMembers = useCallback(() => {
    setMembers(initialMembers);
    localStorage.removeItem('risor_jujutsu_members');
    initialMembers.forEach((m) => {
      saveMemberToFirestore(m).catch(() => {});
    });
  }, []);

  // Dynamic semesters
  const availableSemesters = useMemo(() => {
    const set = new Set<string>(DEFAULT_SEMESTERS);
    members.forEach((m) => {
      if (m.semester) set.add(m.semester);
    });
    return Array.from(set);
  }, [members]);

  return {
    members,
    setMembers,
    isLoading,
    addMember,
    updateMember,
    deleteMember,
    toggleFee,
    resetMembers,
    availableSemesters,
  };
}
