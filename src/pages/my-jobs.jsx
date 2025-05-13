import CreatedApplications from "@/components/created-applications";
import CreatedJobs from "@/components/created-jobs";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";

const MyJobs = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white px-6 py-10">
      <Button
        onClick={() => navigate("/")}
        className="mb-4 bg-red-700 hover:bg-blue-600 text-white"
      >
        Back 
      </Button>
      <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl text-center pb-8">
        {user?.unsafeMetadata?.role === "candidate"
          ? "My Applications"
          : "My Jobs"}
      </h1>
      {user?.unsafeMetadata?.role === "candidate" ? (
        <CreatedApplications />
      ) : (
        <CreatedJobs />
      )}
    </div>
  );
};

export default MyJobs;