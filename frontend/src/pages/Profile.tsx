import {useState, useEffect} from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import {useApp} from '@/contexts/AppContext';
import {BankAccountService} from '@/services/bank-account.service';
import {IPAService} from '@/services/ipa.service';
import {UserService} from '@/services/user.service';
import {AuthService} from '@/services/auth.service';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Separator} from '@/components/ui/separator';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {useToast} from '@/hooks/use-toast';
import {CreditCard, Lock, User, AlertTriangle, CheckCircle2, XCircle} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import PinVerification from '@/components/PinVerification';

// Change PIN Dialog Component
const ChangePinDialog = ({ipaId, ipaAddress}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState('verify');
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isPinVerified, setIsPinVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [pinError, setPinError] = useState('');
    const {toast} = useToast();

    // Reset the form when dialog closes
    const handleDialogChange = (open) => {
        if (!open) {
            resetForm();
        }
        setIsOpen(open);
    };

    const resetForm = () => {
        setCurrentStep('verify');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setIsPinVerified(false);
        setPinError('');
    };

    const handleVerifyPin = async () => {
        if (!currentPin) {
            setPinError('Please enter your current PIN');
            return;
        }

        setIsVerifying(true);
        setPinError('');

        try {
            // Send ipa_address instead of ipa_id
            const data = {
                ipa_address: ipaAddress,
                pin: currentPin
            };

            const response = await IPAService.verifyPin(data);

            if (response && response.valid) {
                setIsPinVerified(true);
                setCurrentStep('change');
                toast({
                    title: "PIN Verified",
                    description: "Current PIN is correct. You can now set a new PIN.",
                });
            } else {
                setPinError('Incorrect PIN. Please try again.');
                setIsPinVerified(false);
            }
        } catch (error) {
            console.error('Error verifying PIN:', error);
            setPinError('Failed to verify PIN. Please try again.');
            setIsPinVerified(false);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleUpdatePin = async () => {
        // Validate new PIN format (numeric and at least 4 digits)
        if (!newPin || newPin.length < 4 || !/^\d+$/.test(newPin)) {
            setPinError('PIN must be at least 4 digits');
            return;
        }

        // Confirm both PINs match
        if (newPin !== confirmPin) {
            setPinError('PINs do not match');
            return;
        }

        setIsUpdating(true);
        setPinError('');

        try {
            const data = {
                ipa_address: ipaAddress,
                new_pin: newPin
            };

            const response = await IPAService.updatePin(data);

            if (response && response.success) {
                toast({
                    title: "Success",
                    description: "Your IPA PIN has been updated successfully",
                });
                // Close the dialog after successful update
                handleDialogChange(false);
            } else {
                setPinError('Failed to update PIN. Please try again.');
            }
        } catch (error) {
            console.error('Error updating PIN:', error);
            setPinError('Failed to update PIN. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">Change PIN</Button>
            </DialogTrigger>

            <DialogContent className="w-[95%] max-w-md mx-auto">
                <DialogHeader>
                    <DialogTitle>Change IPA PIN</DialogTitle>
                    <DialogDescription className="break-words">
                        Update the security PIN for your IPA address: <span className="font-medium">{ipaAddress}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {pinError && (
                        <div className="bg-red-50 p-3 rounded-md flex items-center gap-2 text-red-700 text-sm">
                            <XCircle className="h-4 w-4 flex-shrink-0"/>
                            <span className="text-xs sm:text-sm">{pinError}</span>
                        </div>
                    )}

                    {currentStep === 'verify' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-pin">Current PIN</Label>
                                <Input
                                    id="current-pin"
                                    type="password"
                                    value={currentPin}
                                    onChange={(e) => setCurrentPin(e.target.value)}
                                    placeholder="Enter your current PIN"
                                    autoComplete="current-password"
                                    maxLength={6}
                                    className="text-base"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 'change' && (
                        <div className="space-y-4">
                            {isPinVerified && (
                                <div
                                    className="bg-green-50 p-3 rounded-md flex items-center gap-2 text-green-700 text-sm">
                                    <CheckCircle2 className="h-4 w-4 flex-shrink-0"/>
                                    <span className="text-xs sm:text-sm">Current PIN verified successfully</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="new-pin">New PIN</Label>
                                <Input
                                    id="new-pin"
                                    type="password"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value)}
                                    placeholder="Enter new PIN"
                                    autoComplete="new-password"
                                    maxLength={6}
                                    className="text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-pin">Confirm New PIN</Label>
                                <Input
                                    id="confirm-pin"
                                    type="password"
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value)}
                                    placeholder="Confirm new PIN"
                                    autoComplete="new-password"
                                    maxLength={6}
                                    className="text-base"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => handleDialogChange(false)} className="w-full sm:w-auto">
                        Cancel
                    </Button>

                    {currentStep === 'verify' && (
                        <Button
                            onClick={handleVerifyPin}
                            disabled={isVerifying || !currentPin}
                            className="w-full sm:w-auto"
                        >
                            {isVerifying ? 'Verifying...' : 'Verify PIN'}
                        </Button>
                    )}

                    {currentStep === 'change' && (
                        <Button
                            onClick={handleUpdatePin}
                            disabled={isUpdating || !newPin || !confirmPin}
                            className="w-full sm:w-auto"
                        >
                            {isUpdating ? 'Updating...' : 'Update PIN'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// New verification dialog component for email and phone updates
const VerificationDialog = ({isOpen, onClose, type, value, onVerified}) => {
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationPin, setVerificationPin] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const {toast} = useToast();

    // Generate and send verification code
    useEffect(() => {
        if (isOpen) {
            generateVerificationCode();
        }
    }, [isOpen, value]);

    // Generate verification PIN
    const generateVerificationCode = () => {
        // For email: 6-digit code, for phone: 4-digit code
        const codeLength = type === 'email' ? 6 : 4;
        const minVal = type === 'email' ? 100000 : 1000;
        const maxVal = type === 'email' ? 999999 : 9999;
        const code = Math.floor(minVal + Math.random() * (maxVal - minVal + 1)).toString();

        setVerificationPin(code);

        // Call the appropriate service to send the code
        if (type === 'email') {
            // In a real app, this would send an email
            AuthService.sendVerificationCode(value, code);
            toast({
                title: "Verification Code Sent",
                description: `A verification code has been sent to ${value}`,
            });
        } else {
            // In a real app, this would send an SMS
            AuthService.sendCode(value, code);
            toast({
                title: "Verification Code Sent",
                description: `A verification code has been sent to ${value}`,
            });
        }

        return code;
    };

    // Handle verification submission
    const handleVerificationSubmit = async (code) => {
        if (!code) {
            setError('Please enter the verification code');
            return;
        }

        if (code !== verificationPin) {
            setError('Incorrect verification code');
            return;
        }

        setIsVerifying(true);
        try {
            // Verification is successful
            toast({
                title: "Verification Successful",
                description: `Your ${type} has been verified successfully`,
            });

            // Call the callback to proceed with the update
            if (onVerified) {
                onVerified();
            }

            // Close the dialog
            onClose();
        } catch (error) {
            console.error(`${type} verification error:`, error);
            setError('Failed to verify. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    // Handle resend code
    const handleResendCode = () => {
        setIsVerifying(true);
        setTimeout(() => {
            const newCode = generateVerificationCode();
            setVerificationPin(newCode);
            setIsVerifying(false);
        }, 1000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95%] max-w-md mx-auto">
                <DialogHeader>
                    <DialogTitle>Verify Your {type === 'email' ? 'Email' : 'Phone Number'}</DialogTitle>
                    <DialogDescription className="break-words">
                        Please enter the verification code sent to
                        your {type === 'email' ? 'email' : 'phone number'}: <span className="font-medium">{value}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="bg-red-50 p-3 rounded-md flex items-center gap-2 text-red-700 text-sm">
                            <XCircle className="h-4 w-4 flex-shrink-0"/>
                            <span className="text-xs sm:text-sm">{error}</span>
                        </div>
                    )}

                    <div className="w-full flex justify-center">
                        <PinVerification
                            onPinSubmit={handleVerificationSubmit}
                            isLoading={isVerifying}
                            title={`Enter ${type === 'email' ? 'Email' : 'Phone'} Verification Code`}
                            maxLength={type === 'email' ? 6 : 4}
                            expectedPin={verificationPin}
                            onResend={handleResendCode}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const Profile = () => {
    const {user, updateUserData, logout} = useApp();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
    });
    const [originalData, setOriginalData] = useState({
        email: '',
        phoneNumber: ''
    });
    const [accounts, setAccounts] = useState([]);
    const [ipas, setIpas] = useState([]);
    const [defaultIpaId, setDefaultIpaId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [settingDefaultIpa, setSettingDefaultIpa] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // New state for verification
    const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
    const [verificationType, setVerificationType] = useState(''); // 'email' or 'phone'
    const [verificationValue, setVerificationValue] = useState('');
    const [pendingUpdate, setPendingUpdate] = useState(null);

    const {toast} = useToast();

    useEffect(() => {
        if (user) {
            const userData = {
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                email: user.email || '',
                phoneNumber: user.phone_number || ''
            };

            setFormData(userData);
            setOriginalData({
                email: user.email || '',
                phoneNumber: user.phone_number || ''
            });

            fetchUserData();
        }
    }, [user]);

    // Debug effect to track default IPA changes
    useEffect(() => {
        console.log("Current defaultIpaId:", defaultIpaId);
        console.log("Current IPAs:", ipas);

        // Test the isDefaultIpa function with each IPA
        ipas.forEach(ipa => {
            console.log(`IPA ${ipa.ipa_id || ipa.id} is default:`, isDefaultIpa(ipa.ipa_id || ipa.id));
        });
    }, [defaultIpaId, ipas]);

    const fetchUserData = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            // Fetch bank accounts
            const accountsResponse = await BankAccountService.getAccountsByUserId(user.user_id);
            setAccounts(accountsResponse);

            // Fetch IPAs
            const ipasResponse = await IPAService.getIPAsByUserId(user.user_id);
            setIpas(ipasResponse);
            console.log("Fetched IPAs:", ipasResponse);

            // Fetch default IPA account
            try {
                const defaultAccountResponse = await UserService.getDefaultAccount(user.user_id);
                console.log("Default account response:", defaultAccountResponse);

                if (defaultAccountResponse) {
                    // Handle both potential formats: number or {default_account: number}
                    if (typeof defaultAccountResponse === 'object' && defaultAccountResponse.default_account) {
                        setDefaultIpaId(Number(defaultAccountResponse.default_account));
                    } else {
                        setDefaultIpaId(Number(defaultAccountResponse));
                    }
                }
            } catch (defaultError) {
                console.error('Error fetching default account:', defaultError);
                // Don't show an error toast as this is not critical
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast({
                title: "Error",
                description: "Failed to load your account details",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const {id, value} = e.target;
        setFormData({...formData, [id]: value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.firstName ||
            !formData.lastName ||
            !formData.email ||
            !formData.phoneNumber
        ) {
            toast({
                title: "Error",
                description: "All fields are required",
                variant: "destructive",
            });
            return;
        }

        // Check if email or phone number has changed
        if (formData.email !== originalData.email) {
            // Initiate email verification
            setVerificationType('email');
            setVerificationValue(formData.email);
            setPendingUpdate({
                ...formData,
                type: 'email'
            });
            setVerificationDialogOpen(true);
            return;
        } else if (formData.phoneNumber !== originalData.phoneNumber) {
            // Initiate phone verification
            setVerificationType('phone');
            setVerificationValue(formData.phoneNumber);
            setPendingUpdate({
                ...formData,
                type: 'phone'
            });
            setVerificationDialogOpen(true);
            return;
        } else {
            // No sensitive fields changed, proceed with update
            await updateProfile(formData);
        }
    };

    // Function to handle actual profile update after verification
    const updateProfile = async (data) => {
        setIsUpdating(true);
        try {
            await updateUserData({
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                phone_number: data.phoneNumber
            });

            // Update originalData after successful update
            setOriginalData({
                email: data.email,
                phoneNumber: data.phoneNumber
            });

            toast({
                title: "Success",
                description: "Your profile has been updated",
            });
        } catch (error) {
            // Error handling is done in updateUserData
            console.error('Profile update error:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Function called after verification is successful
    const handleVerificationSuccess = () => {
        if (pendingUpdate) {
            updateProfile(pendingUpdate);
            setPendingUpdate(null);
        }
    };

    const handleSetDefaultAccount = async (ipaId) => {
        if (!user || !ipaId) return;

        setSettingDefaultIpa(true);
        try {
            // Convert ipaId to number to ensure consistency
            const numericIpaId = Number(ipaId);
            console.log("Setting default IPA to:", numericIpaId);

            await UserService.setDefaultAccount(user.user_id, numericIpaId);
            setDefaultIpaId(numericIpaId);

            toast({
                title: "Success",
                description: "Default IPA account updated successfully",
            });

            // Force a refresh of the UI
            fetchUserData();
        } catch (error) {
            console.error('Error setting default account:', error);
            toast({
                title: "Error",
                description: "Failed to set default IPA account",
                variant: "destructive",
            });
        } finally {
            setSettingDefaultIpa(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== user?.phone_number) {
            toast({
                title: "Error",
                description: "Please enter your phone number correctly to confirm",
                variant: "destructive",
            });
            return;
        }

        setIsUpdating(true);
        try {
            await IPAService.deleteAllByUserId(user.user_id);
            await AuthService.deleteAccount(user.user_id);

            toast({
                title: "Account Deleted",
                description: "Your account has been successfully deleted",
            });

            // Log the user out
            logout();
        } catch (error) {
            console.error('Error deleting account:', error);
            toast({
                title: "Error",
                description: "Failed to delete your account",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const getInitials = () => {
        if (!user) return 'U';
        return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    };

    // Improved function to check if an IPA is the default one
    const isDefaultIpa = (ipaId) => {
        // Convert both to numbers to ensure consistent comparison
        return Number(ipaId) === Number(defaultIpaId);
    };

    // Demo data for display purposes
    const demoAccounts = [];
    const demoIpas = [];

    const displayAccounts = accounts.length ? accounts : demoAccounts;
    const displayIpas = ipas.length ? ipas : demoIpas;

    return (
        <MainLayout>
            <div className="space-y-6 sm:space-y-8 px-2 sm:px-4 md:px-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Your Profile</h1>

                {/* Verification Dialog */}
                <VerificationDialog
                    isOpen={verificationDialogOpen}
                    onClose={() => setVerificationDialogOpen(false)}
                    type={verificationType}
                    value={verificationValue}
                    onVerified={handleVerificationSuccess}
                />

                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="mb-4 sm:mb-6 w-full grid grid-cols-3">
                        <TabsTrigger value="personal" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                            <User className="h-3 w-3 sm:h-4 sm:w-4"/>
                            <span className="hidden xs:inline">Personal Info</span>
                            <span className="xs:hidden">Personal</span>
                        </TabsTrigger>
                        <TabsTrigger value="accounts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4"/>
                            <span className="hidden xs:inline">Accounts & IPAs</span>
                            <span className="xs:hidden">Accounts</span>
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                            <Lock className="h-3 w-3 sm:h-4 sm:w-4"/>
                            <span>Security</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Personal Info Tab */}
                    <TabsContent value="personal">
                        <Card className="w-full">
                            <CardHeader className="px-4 sm:px-6">
                                <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Update your personal
                                    details</CardDescription>
                            </CardHeader>

                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                                    <div className="flex justify-center mb-2 sm:mb-4">
                                        <Avatar className="h-16 w-16 sm:h-24 sm:w-24">
                                            <AvatarFallback
                                                className="bg-falsopay-primary text-white text-xl sm:text-2xl">
                                                {getInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-1 sm:space-y-2">
                                            <Label htmlFor="firstName" className="text-sm">First Name</Label>
                                            <Input
                                                id="firstName"
                                                placeholder="Your first name"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="text-sm sm:text-base"
                                            />
                                        </div>

                                        <div className="space-y-1 sm:space-y-2">
                                            <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                placeholder="Your last name"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="text-sm sm:text-base"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1 sm:space-y-2">
                                        <Label htmlFor="email" className="text-sm">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Your email address"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="text-sm sm:text-base"
                                        />
                                        {formData.email !== originalData.email && (
                                            <p className="text-xs text-amber-600 mt-1">
                                                Changing your email will require verification
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1 sm:space-y-2">
                                        <Label htmlFor="phoneNumber" className="text-sm">Phone Number</Label>
                                        <Input
                                            id="phoneNumber"
                                            placeholder="Your phone number"
                                            value={formData.phoneNumber}
                                            disabled
                                            onChange={handleChange}
                                            className="text-sm sm:text-base"
                                        />
                                        {formData.phoneNumber !== originalData.phoneNumber && (
                                            <p className="text-xs text-amber-600 mt-1">
                                                Changing your phone number will require verification
                                            </p>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="flex justify-end px-4 sm:px-6 pb-4 sm:pb-6">
                                    <Button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="w-full sm:w-auto"
                                    >
                                        {isUpdating ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* Accounts Tab */}
                    <TabsContent value="accounts">
                        <Card className="mb-6 sm:mb-8 w-full">
                            <CardHeader className="px-4 sm:px-6">
                                <CardTitle className="text-lg sm:text-xl">Linked Bank Accounts</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Manage your connected bank
                                    accounts</CardDescription>
                            </CardHeader>

                            <CardContent className="px-4 sm:px-6">
                                {displayAccounts.map((account) => (
                                    <div key={account.id}
                                         className="py-3 sm:py-4 border-b border-gray-200 last:border-0">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                            <div>
                                                <h3 className="font-medium text-sm sm:text-base">{account.bank_name}</h3>
                                                <p className="text-xs sm:text-sm text-gray-500">{account.account_number}</p>
                                                <p className="text-xs text-gray-400">{account.type} • {account.iban}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {displayAccounts.length === 0 && (
                                    <div className="text-center py-4 sm:py-6">
                                        <p className="text-gray-500 text-sm">No bank accounts linked yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="w-full">
                            <CardHeader className="px-4 sm:px-6">
                                <CardTitle className="text-lg sm:text-xl">Your IPA Addresses</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Instant Payment Addresses for receiving
                                    money</CardDescription>
                            </CardHeader>

                            <CardContent className="px-4 sm:px-6">
                                {isLoading ? (
                                    <div className="text-center py-4 sm:py-6">
                                        <p className="text-gray-500 text-sm">Loading your IPA addresses...</p>
                                    </div>
                                ) : (
                                    <>
                                        {displayIpas.map((ipa) => {
                                            // Get the IPA ID from the appropriate field (ipa_id for API data, id for demo data)
                                            const ipaId = ipa.ipa_id !== undefined ? ipa.ipa_id : ipa.id;
                                            const isDefault = isDefaultIpa(ipaId);

                                            return (
                                                <div key={ipaId}
                                                     className="py-3 sm:py-4 border-b border-gray-200 last:border-0">
                                                    <div
                                                        className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center flex-wrap gap-2">
                                                                <h3 className="font-medium text-sm sm:text-base break-all">{ipa.ipa_address}</h3>
                                                                {isDefault && (
                                                                    <span
                                                                        className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3"/>Default
                  </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center mt-1 sm:mt-2">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    ipa.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                }`}></span>
                                                                <p className="text-xs sm:text-sm text-gray-500">{ipa.status || 'Active'}</p>
                                                            </div>
                                                            <p className="text-xs text-gray-400">
                                                                Created: {new Date(ipa.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div
                                                            className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                                            <ChangePinDialog
                                                                ipaId={ipaId}
                                                                ipaAddress={ipa.ipa_address}
                                                            />
                                                            {!isDefault && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={settingDefaultIpa}
                                                                    onClick={() => handleSetDefaultAccount(ipaId)}
                                                                    className="text-xs sm:text-sm w-full sm:w-auto"
                                                                >
                                                                    {settingDefaultIpa ? 'Setting...' : 'Set Default'}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {displayIpas.length === 0 && (
                                            <div className="text-center py-4 sm:py-6">
                                                <p className="text-gray-500 text-sm">No IPA addresses found</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>

                            <CardFooter className="flex justify-center px-4 sm:px-6 py-4 sm:py-6">
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                    onClick={() => window.location.href = '/create-ipa'}
                                >
                                    Create New IPA Address
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security">
                        <Card className="w-full">
                            <CardHeader className="px-4 sm:px-6">
                                <CardTitle className="text-red-600 flex items-center gap-2 text-lg sm:text-xl">
                                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5"/>
                                    Delete Account
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Permanently delete your account and all associated data
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="px-4 sm:px-6">
                                <p className="text-gray-600 mb-4 text-xs sm:text-sm">
                                    This action cannot be undone. This will permanently delete your account, all linked
                                    bank accounts, IPA addresses, and transaction history.
                                </p>

                                <Dialog
                                    open={isDeleteDialogOpen}
                                    onOpenChange={setIsDeleteDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" className="w-full sm:w-auto text-xs sm:text-sm">Delete
                                            Account</Button>
                                    </DialogTrigger>
                                    <DialogContent className="w-[95%] max-w-md mx-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-red-600">Delete Account
                                                Confirmation</DialogTitle>
                                            <DialogDescription className="text-xs sm:text-sm">
                                                This action cannot be undone. All your data will be permanently deleted.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4 py-4">
                                            <p className="text-xs sm:text-sm">
                                                To confirm, please enter your phone number: <span
                                                className="font-bold">{user?.phone_number}</span>
                                            </p>
                                            <Input
                                                value={deleteConfirmation}
                                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                placeholder="Enter your phone number"
                                                className="text-sm"
                                            />
                                        </div>

                                        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsDeleteDialogOpen(false)}
                                                className="w-full sm:w-auto"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleDeleteAccount}
                                                disabled={isUpdating || deleteConfirmation !== user?.phone_number}
                                                className="w-full sm:w-auto"
                                            >
                                                {isUpdating ? 'Processing...' : 'Permanently Delete'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
};

export default Profile;