// src/hooks/useProfile.ts
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  type ProfileData,
} from "../store/api/profileApi";
import {
  setProfile,
  setProfileLoading,
  setProfileError,
} from "../store/slice/profileSlice";
import type { RootState, AppDispatch } from "@/store";

/* ---------------- helpers ---------------- */

const requiredFields: Array<
  "name" | "email" | "phone" | "location" | "department" | "position"
> = ["name", "email", "phone", "location", "department", "position"];

const checkProfileCompleteness = (data: Partial<ProfileData>): boolean => {
  return requiredFields.every((field) => {
    const value = data[field];
    return typeof value === "string" && value.trim().length > 0;
  });
};

/* ---------------- hook ---------------- */

export const useProfile = () => {
  const dispatch = useDispatch<AppDispatch>();

  const profile = useSelector((state: RootState) => state.profile);
  const auth = useSelector((state: RootState) => state.auth);

  /* -------- fetch profile -------- */

  const {
    data: profileData,
    isLoading: isFetching,
    error: fetchError,
    refetch,
  } = useGetProfileQuery(undefined, {
    skip: !auth.isAuthenticated,
  });

  /* -------- update profile -------- */

  const [
    updateProfile,
    { isLoading: isUpdating, error: updateError },
  ] = useUpdateProfileMutation();

  /* -------- sync api → redux -------- */

  useEffect(() => {
    if (profileData) {
      dispatch(
        setProfile({
          ...profileData,
          isComplete: checkProfileCompleteness(profileData),
        })
      );
    }
  }, [profileData, dispatch]);

  /* -------- loading state -------- */

  useEffect(() => {
    dispatch(setProfileLoading(isFetching || isUpdating));
  }, [isFetching, isUpdating, dispatch]);

  /* -------- error state -------- */

  useEffect(() => {
    const errorMessage =
      (fetchError as { data?: { message?: string } })?.data?.message ||
      (updateError as { data?: { message?: string } })?.data?.message ||
      null;

    dispatch(setProfileError(errorMessage));
  }, [fetchError, updateError, dispatch]);

  /* -------- init from auth -------- */

  useEffect(() => {
    if (
      auth.isAuthenticated &&
      !profileData &&
      auth.name &&
      auth.email
    ) {
      dispatch(
        setProfile({
          name: auth.name,
          email: auth.email,
          isComplete: false,
        })
      );
    }
  }, [auth, profileData, dispatch]);

  /* -------- update handler -------- */

  const handleUpdateProfile = async (data: Partial<ProfileData>) => {
    try {
      const result = await updateProfile(data).unwrap();

      dispatch(
        setProfile({
          ...result,
          isComplete: checkProfileCompleteness(result),
        })
      );

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  /* -------- exposed api -------- */

  return {
    profile,
    isFetching,
    isUpdating,
    error: profile.error,
    updateProfile: handleUpdateProfile,
    refetchProfile: refetch,
    isProfileComplete: profile.isComplete,
  };
};
