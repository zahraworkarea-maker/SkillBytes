import { useState, useEffect } from 'react';
import { PBLCase, PBLSection } from '@/lib/types/pbl.types';
import { pblService } from '@/lib/api-services';

interface UsePBLCaseResult {
  caseData: (PBLCase & { sections?: PBLSection[] }) | null;
  sections: PBLSection[] | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Fetch PBL case data by slug
 * @param slug - Case slug from URL params
 * @returns Object with caseData (includes sections), sections separately, loading state, and error
 */
export function usePBLCase(slug: string): UsePBLCaseResult {
  const [caseData, setCaseData] = useState<(PBLCase & { sections?: PBLSection[] }) | null>(null);
  const [sections, setSections] = useState<PBLSection[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[USE-PBL-CASE] Starting to fetch PBL case with slug:', slug);
        console.log('[USE-PBL-CASE] API URL:', process.env.NEXT_PUBLIC_API_URL);

        // Extract ID from slug (slug format: "title-randomString")
        // For now, try to get all cases and find by slug, then fetch by ID
        console.log('[USE-PBL-CASE] Fetching all cases to find by slug...');
        const casesResponse = await pblService.getAllCases(1, 100);
        console.log('[USE-PBL-CASE] Cases response received:', casesResponse);
        
        const caseFromList = casesResponse.data.find(
          (c: PBLCase) => c.slug === slug
        );

        if (!caseFromList) {
          throw new Error(`Case dengan slug "${slug}" tidak ditemukan`);
        }

        console.log('[USE-PBL-CASE] Case found by slug, ID:', caseFromList.id);
        console.log('[USE-PBL-CASE] Fetching full case data with sections...');

        // Fetch complete case data with sections by ID
        const fullCaseResponse = await pblService.getCaseById(caseFromList.id);
        console.log('[USE-PBL-CASE] Full case response received:', fullCaseResponse);
        
        const fullCaseData = fullCaseResponse.data || fullCaseResponse;

        console.log('[USE-PBL-CASE] Case data processed:', {
          id: fullCaseData.id,
          title: fullCaseData.title,
          sectionsCount: fullCaseData.sections?.length || 0,
        });

        setCaseData(fullCaseData);

        // Extract sections from the case data
        const sectionsData = fullCaseData.sections || [];
        setSections(sectionsData);
        
        console.log('[USE-PBL-CASE] Data loaded successfully');
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Failed to fetch PBL case');
        setError(errorObj);
        console.error('[USE-PBL-CASE] Error fetching PBL case:', {
          slug,
          error: errorObj.message,
          fullError: err,
        });
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCaseData();
    } else {
      console.warn('[USE-PBL-CASE] No slug provided');
    }
  }, [slug]);

  return {
    caseData,
    sections,
    loading,
    error,
  };
}
