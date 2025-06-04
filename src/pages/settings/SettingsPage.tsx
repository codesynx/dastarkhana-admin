import TopBar from "@/components/shared/topBar";
import { useState } from "react";
import AdminList from "./components/AdminList";
import AdminForm from "./components/AdminForm";
// ChangePasswordForm import removed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react"; // Added Search icon
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"; // Assuming this path for Radix Dialog

// AdminData interface removed as it's not used here
// The AdminList component handles its own Admin type internally

export default function SettingsPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // isChangePasswordModalOpen state and related functions removed
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState(""); // New state for search

    const handleAddAdminFormSubmit = () => {
        setIsAddModalOpen(false);
        setRefreshKey(prev => prev + 1);
    };
    
    const handleAddAdminModalClose = () => {
        setIsAddModalOpen(false);
    }

    // handleChangePasswordFormSubmit and handleChangePasswordModalClose removed

    return (
        <main className="p-6 space-y-6">
            <TopBar text="Баптаулар" /> {/* Changed text */}
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative flex-grow mr-4"> {/* Made input take more space */}
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input 
                            type="search"
                            placeholder="Әкімшілерді іздеу (аты немесе email бойынша)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full md:w-2/3 lg:w-1/2" // Adjusted width classes
                        />
                    </div>
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger>
                            <Button onClick={() => setIsAddModalOpen(true)} className="flex-shrink-0">Жаңа әкімші қосу</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Жаңа әкімші қосу</DialogTitle>
                            </DialogHeader>
                            <AdminForm
                                onFormSubmit={handleAddAdminFormSubmit}
                                onCancel={handleAddAdminModalClose}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
                <AdminList 
                    refreshKey={refreshKey}
                    onRefresh={() => setRefreshKey(prev => prev + 1)}
                    searchTerm={searchTerm} // Pass search term
                />
            </div>
        </main>
    );
}
