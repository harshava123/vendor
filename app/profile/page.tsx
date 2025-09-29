"use client";
import { useState, useEffect } from "react";
import { FilePenLine, Download, FileText, LogOut, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ProfileData {
  vendorID: string;
  name: string;
  mobileNumber: string;
  email: string;
  storeName: string;
  address: string;
  language: string;
  gstNumber: string;
  shopDocuments: string;
  idProof: string;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [, setShopDocFile] = useState<File | null>(null);
  const [, setIdProofFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const now = new Date().toISOString();
      const profileData: ProfileData = {
        vendorID: "V-1",
        name: "Demo Vendor",
        mobileNumber: "+91-9000000000",
        email: "vendor@example.com",
        storeName: "Demo Store",
        address: "123 Demo Street, Demo City",
        language: "English",
        gstNumber: "GSTIN1234",
        shopDocuments: "/files/demo-shop-doc.pdf",
        idProof: "/files/demo-id-proof.pdf",
        approvalStatus: "PENDING",
        createdAt: now,
        updatedAt: now,
      };
      setProfile(profileData);
    } catch (error) {
      console.error("Profile dummy fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to load dummy profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // Dummy save: simulate delay and keep local state
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast({
        title: "Success",
        description: "Profile updated (dummy)",
        className: "bg-green-500 text-white",
      });

      setIsEditing(false);
      // Reset file states
      setShopDocFile(null);
      setIdProofFile(null);
      await fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error("Error updating dummy profile:", error);
      toast({
        title: "Error",
        description: "Failed to update dummy profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    type: "shopDocuments" | "idProof"
  ) => {
    try {
      // Dummy upload: create local object URL and update profile paths
      const url = URL.createObjectURL(file);
      setProfile((prev) =>
        prev ? ({ ...prev, [type]: url } as ProfileData) : prev
      );
      toast({
        title: "Success",
        description: `${
          type === "shopDocuments" ? "Shop document" : "ID Proof"
        } updated (dummy)`,
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error(`Error dummy uploading ${type}:`, error);
      toast({
        title: "Error",
        description: `Failed to update ${
          type === "shopDocuments" ? "shop document" : "ID proof"
        } (dummy)`,
        variant: "destructive",
      });
    }
  };

  const renderField = (
    label: string,
    value: string | undefined,
    key: keyof ProfileData
  ) => {
    if (!profile) return null;

    return (
      <div className="border-b border-neutral-300 py-4">
        <div className="grid grid-cols-3 items-center">
          <span className="text-gray-600 font-medium">{label}</span>
          <div className="col-span-2">
            {isEditing && key !== "shopDocuments" && key !== "idProof" ? (
              <Input
                value={value}
                onChange={(e) =>
                  setProfile({ ...profile, [key]: e.target.value })
                }
                className="w-full"
              />
            ) : (
              <span className="text-gray-500">{value}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderShopDocuments = () => (
    <div className="border-b border-neutral-300 py-4">
      <div className="grid grid-cols-3 items-center">
        <span className="text-gray-600 font-medium">Shop Documents</span>
        <div className="col-span-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setShopDocFile(file);
                    handleFileUpload(file, "shopDocuments");
                  }
                }}
                className="w-full"
              />
              <Upload className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </div>
          ) : (
            <a
              href={profile?.shopDocuments}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center gap-2"
            >
              View Document
              <FileText className="h-5 w-5 text-gray-400" />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const renderIdProof = () => (
    <div className="border-b border-neutral-300 py-4">
      <div className="grid grid-cols-3 items-center">
        <span className="text-gray-600 font-medium">ID Proof</span>
        <div className="col-span-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIdProofFile(file);
                    handleFileUpload(file, "idProof");
                  }
                }}
                className="w-full"
              />
              <Upload className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <a
                href={profile?.idProof}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-2"
              >
                View ID Proof
                <FileText className="h-5 w-5 text-gray-400" />
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(profile?.idProof, "_blank")}
              >
                <Download className="h-5 w-5 text-blue-500" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!profile) {
    return <div className="p-6">No profile data found</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        {!isEditing && (
          <Button
            onClick={handleEdit}
            className="hover:bg-gray-200 cursor-pointer bg-transparent"
          >
            <FilePenLine className="h-8 w-8 bg-transparent" />
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg  p-6">
        {renderField("Store Name", profile.storeName, "storeName")}
        {renderField("Vendor Name", profile.name, "name")}
        {renderField("Contact Number", profile.mobileNumber, "mobileNumber")}
        {renderField("Email", profile.email, "email")}
        {renderField("Address", profile.address, "address")}
        {renderField("Language", profile.language, "language")}
        {renderField("GST Number", profile.gstNumber, "gstNumber")}

        {renderShopDocuments()}
        {renderIdProof()}

        {/* Approval Status */}
        <div className="border-b border-neutral-300 py-4">
          <div className="grid grid-cols-3 items-center">
            <span className="text-gray-600 font-medium">Approval Status</span>
            <div className="col-span-2">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  profile.approvalStatus === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {profile.approvalStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Save Changes button - only show when editing */}
        {isEditing && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} className="bg-black text-white w-40">
              Save Changes
            </Button>
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-6 flex justify-end">
          <Button variant="destructive" className="flex items-center gap-2 cursor-pointer">
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
