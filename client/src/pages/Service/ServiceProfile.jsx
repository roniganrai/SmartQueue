import React, { useEffect, useState } from "react";
import API from "../../api/axios";

export default function ServiceProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/service/profile");
        setProfile(res.data);
      } catch (err) {
        try {
          const a = await API.get("/auth/profile");
          setProfile(a.data?.user);
        } catch (e) {
          console.error(e);
        }
      }
    })();
  }, []);

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-100 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="grid md:grid-cols-2 gap-3 text-gray-700">
        <div>
          <div className="text-sm text-gray-500">Name</div>
          <div className="font-medium">
            {profile.full_name || profile.service_name}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Email</div>
          <div className="font-medium">{profile.email}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Phone</div>
          <div className="font-medium">{profile.mobile_number}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Location</div>
          <div className="font-medium">{profile.service_location}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Working hours</div>
          <div className="font-medium">
            {profile.service_start} - {profile.service_end}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Staff Count</div>
          <div className="font-medium">{profile.staff_count ?? "-"}</div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => alert("Edit not implemented")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
