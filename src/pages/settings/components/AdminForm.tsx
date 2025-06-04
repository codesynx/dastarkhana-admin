import React, { useState } from 'react'; // useEffect removed
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiInstance } from '@/lib/axios';
import toast from 'react-hot-toast';

const adminFormSchema = z.object({
    email: z.string().email({ message: "Жарамсыз электрондық пошта мекенжайы." }),
    name: z.string().optional(),
    password: z.string().min(6, { message: "Құпиясөз кемінде 6 таңбадан тұруы керек." }).optional(),
});

export type AdminFormValues = z.infer<typeof adminFormSchema>;

interface AdminFormProps {
    // adminToEdit prop removed
    onFormSubmit: () => void; // Callback to refresh list or close modal
    onCancel: () => void;
}

const AdminForm: React.FC<AdminFormProps> = ({ onFormSubmit, onCancel }) => {
    // isEditing logic removed
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset, // Keep reset to clear form after submission or on cancel
        formState: { errors },
    } = useForm<AdminFormValues>({
        resolver: zodResolver(adminFormSchema),
        defaultValues: { // Default values for adding a new admin
            email: '',
            name: '',
            password: '',
        },
    });

    // useEffect for resetting based on adminToEdit removed
    // Also, the previous useEffect for resetting the form when adminToEdit changed was removed
    // because adminToEdit prop itself was removed. The form now always initializes for adding.

    const onSubmit: SubmitHandler<AdminFormValues> = async (data) => {
        setIsSubmitting(true);
        toast.loading("Қосылуда..."); // Only "Adding..." message

        try {
            // Logic for isEditing removed, only add admin logic remains
            if (!data.password) { // Password is required for new admin
                toast.dismiss();
                toast.error("Жаңа әкімші үшін құпиясөз қажет.");
                setIsSubmitting(false);
                return;
            }
            await apiInstance.post('/auth/admins', {
                email: data.email,
                name: data.name ?? "", 
                password: data.password,
            });
            toast.dismiss();
            toast.success("Әкімші сәтті қосылды!");
            reset(); // Reset form fields after successful submission
            onFormSubmit();
        } catch (error: any) {
            toast.dismiss();
            console.error("Error submitting admin form:", error);
            const errorMsg = error.response?.data?.error || error.response?.data?.errors?.join(', ') || "Бір қате орын алды.";
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
                <Label htmlFor="name">Аты-жөні (міндетті емес)</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            {/* Password field always shown for adding new admin */}
            <div>
                <Label htmlFor="password">Құпиясөз</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            {/* Editing specific message removed */}
            <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { onCancel(); reset(); }} disabled={isSubmitting}>
                    Болдырмау
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Қосылуда..." : "Қосу"}
                </Button>
            </div>
        </form>
    );
};

export default AdminForm;
