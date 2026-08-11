import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function useProfile() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);

  const [chefRequestStatus, setChefRequestStatus] = useState(null);
  const [chefRequestRejectReason, setChefRequestRejectReason] = useState(null);

  const isLoading = authLoading || (isAuthenticated && !profile && !profileError);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const fetchProfileData = async () => {
        try {
          const token = localStorage.getItem("token");

          const response = await fetch("/api/user/profile", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const result = await response.json();

          if (response.ok && result.status === "success") {
            setProfile(result.data);
          } else {
            setProfileError(true);
          }
        } catch (error) {
          console.error("Failed to fetch user profile details:", error);

          setProfileError(true);
        }
      };

      fetchProfileData();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const fetchChefRequestStatus = async () => {
        try {
          const token = localStorage.getItem("token");

          const response = await fetch("/api/user/chefrequeststatus", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const result = await response.json();

          if (response.ok && result.status === "success") {
            setChefRequestStatus(result.data.chefRequestStatus);
            setChefRequestRejectReason(result.data.chefRequestRejectReason || null);
          }
        } catch (error) {
          console.error("Failed to fetch chef request status:", error);
        }
      };

      fetchChefRequestStatus();
    }
  }, [authLoading, isAuthenticated]);

  const retryProfile = () => {
    window.location.reload();
  };

  return {
    isAuthenticated,
    authLoading,
    isLoading,

    profile,
    profileError,

    chefRequestStatus,
    chefRequestRejectReason,

    retryProfile,
  };
}
