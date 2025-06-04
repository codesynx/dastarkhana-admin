import React, { useEffect, useState } from 'react';
import { apiInstance } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react'; // Pencil removed as edit is gone
import toast from 'react-hot-toast';
import LoadingPage from '@/components/shared/LoadingPage';
import { useAuth } from '@/constants/AuthContext'; // To get current user

interface Admin {
    id: number;
    email: string;
    name: string | null;
    createdAt: string;
}

interface AdminListProps {
    refreshKey: number;
    onRefresh: () => void;
    searchTerm: string; // Added searchTerm prop
}

const AdminList: React.FC<AdminListProps> = ({ refreshKey, onRefresh, searchTerm }) => {
    const { user: currentUser } = useAuth(); // Get the currently logged-in admin
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdmins = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiInstance.get('/auth/admins');
                setAdmins(response.data);
            } catch (err) {
                console.error("Error fetching admins:", err);
                setError("Әкімшілерді жүктеу мүмкін болмады.");
                toast.error("Әкімшілерді жүктеу мүмкін болмады.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdmins();
    }, [refreshKey]);

    useEffect(() => {
        // Filter admins when searchTerm or admins list changes
        if (searchTerm) {
            setFilteredAdmins(
                admins.filter(admin =>
                    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        } else {
            setFilteredAdmins(admins);
        }
    }, [searchTerm, admins]);

    const handleDeleteAdmin = async (adminId: number) => {
        if (!confirm("Сіз бұл әкімшіні жойғыңыз келетініне сенімдісіз бе?")) {
            return;
        }
        try {
            toast.loading("Жойылуда...");
            await apiInstance.delete(`/auth/admins/${adminId}`);
            toast.dismiss();
            toast.success("Әкімші сәтті жойылды.");
            onRefresh(); // Trigger a refresh in the parent component
        } catch (err) {
            toast.dismiss();
            console.error("Error deleting admin:", err);
            toast.error("Әкімшіні жою мүмкін болмады.");
        }
    };

    if (isLoading) {
        return <LoadingPage />;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (filteredAdmins.length === 0 && !isLoading) {
        return <p>{searchTerm ? "Іздеу нәтижесінде әкімшілер табылмады." : "Әкімшілер жоқ."}</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">Аты-жөні</th>
                        <th className="py-3 px-4 text-left">Email</th>
                        <th className="py-3 px-4 text-left">Қосылған уақыты</th>
                        <th className="py-3 px-4 text-center">Әрекеттер</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAdmins.map((admin) => (
                        <tr key={admin.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{admin.id}</td>
                            <td className="py-3 px-4">{admin.name || '-'}</td>
                            <td className="py-3 px-4">{admin.email}</td>
                            <td className="py-3 px-4">
                                {new Date(admin.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-center">
                                {/* Edit button removed */}
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteAdmin(admin.id)}
                                    disabled={currentUser?.id === admin.id} // Disable if current user
                                    title={currentUser?.id === admin.id ? "Өзіңізді жоя алмайсыз" : "Жою"}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminList;
