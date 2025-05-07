import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Trash2 } from 'lucide-react';
import PinVerification from '@/components/PinVerification';
import { AuthService } from '@/services/auth.service';
import {UserData, UserService} from "@/services/user.service.ts";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AuthFlow = () => {
    // State for each step of the authentication flow
    const [phoneNumber, setPhoneNumber] = useState('');
    const [ipaAddress, setIpaAddress] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    // Email verification state
    const [emailVerificationCode, setEmailVerificationCode] = useState('');
    const [emailForVerification, setEmailForVerification] = useState('');

    // Flow control states
    const [currentStep, setCurrentStep] = useState('phone-entry');
    const [isLoading, setIsLoading] = useState(false);
    const [verificationPin, setVerificationPin] = useState('');

    // User account status
    const [userExists, setUserExists] = useState(false);
    const [isDefaultAccount, setIsDefaultAccount] = useState(false);
    const [isUserBlocked, setIsUserBlocked] = useState(false);

    // Hooks
    const { login, verifyLoginCode } = useApp();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get('returnTo') || '/dashboard';

    // Generate verification PIN (mock implementation)
    const generatePin = () => {
        const $code = Math.floor(1000 + Math.random() * 9000).toString();
        AuthService.sendCode(phoneNumber, $code); // Assuming this is just a mock and doesn't need to be awaited
        return $code;
    }

    // Generate email verification code
    const generateEmailVerificationCode = () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        // In a real app, you would send this via email
        console.log('Email verification code:', code);
        // Simulating email sending
        toast({
            title: "Verification Code Sent",
            description: `A verification code has been sent to ${emailForVerification}`,
        });
        return code;
    }

    // Step 1: Handle phone number submission
    const handlePhoneSubmit = async (e) => {
        e?.preventDefault();

        if (!phoneNumber) {
            toast({
                title: "Error",
                description: "Please enter your phone number",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Check if user exists with this phone number
            const exists = await AuthService.checkIfUserExists({ phone_number: phoneNumber });
            setUserExists(exists);

            if (exists) {
                // Fetch user data to check if it's a default account
                const userData = await UserService.getUserByPhone(phoneNumber);
                console.log("User data:", userData);
                // Fixed logic: isDefaultAccount should be true if default_account is truthy
                setIsDefaultAccount(!!userData.default_account);
                
                // Check if the user account is blocked
                if (userData.status === 'blocked') {
                    setIsUserBlocked(true);
                    toast({
                        title: "Account Blocked",
                        description: "Your account has been blocked. Please contact support for assistance.",
                        variant: "destructive",
                    });
                    setCurrentStep('account-blocked');
                    setIsLoading(false);
                    return;
                } else {
                    setIsUserBlocked(false);
                }
            }

            // Generate and send verification code locally
            const newPin = generatePin();
            setVerificationPin(newPin);

            toast({
                title: "Verification Code Sent",
                description: "A verification code has been sent to your phone number",
            });

            setCurrentStep('phone-verification');
        } catch (error) {
            console.error('Phone submission error:', error);
            toast({
                title: "Error",
                description: "Failed to process your phone number. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Handle phone verification code submission
    const handleVerificationSubmit = async (code) => {
        if (!code || code.length !== 4) {
            toast({
                title: "Error",
                description: "Please enter the 4-digit verification code",
                variant: "destructive",
            });
            return;
        }

        if (code !== verificationPin) {
            toast({
                title: "Error",
                description: "Incorrect verification code",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Step 3: Check Phone Number Status logic
            if (!userExists) {
                // Begin registration process if phone doesn't exist
                setCurrentStep('registration');
            } else if (isDefaultAccount) {
                // User exists and has default account (needs IPA verification)
                setCurrentStep('default-account');
            } else {
                // User exists with no default account - log in directly
                // Pass null as IPA address to bypass IPA verification
                const result = await login(phoneNumber, "null");

                if (result && result.success) {
                    // Complete the login process with the verification code
                    if (result.code) {
                        await verifyLoginCode(phoneNumber, result.code, {
                            user: result.user,
                            token: result.token
                        });
                    }

                    toast({
                        title: "Success",
                        description: "You have been successfully logged in!",
                    });
                    navigate(returnTo);
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to log in. Please try again.",
                        variant: "destructive",
                    });
                }
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast({
                title: "Error",
                description: "Failed to verify your phone. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle IPA address verification for existing accounts
    const handleIpaVerification = async (e) => {
        e.preventDefault();

        if (!ipaAddress) {
            toast({
                title: "Error",
                description: "Please enter your IPA address",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Use login with phone number and IPA address
            const result = await login(phoneNumber, ipaAddress);

            if (result && result.success) {
                // If login succeeds, use the verification code from the result for the next step
                if (result.code) {
                    // Pass the user and token directly to avoid race condition
                    await verifyLoginCode(phoneNumber, result.code, {
                        user: result.user,
                        token: result.token
                    });

                    toast({
                        title: "Success",
                        description: "You have been successfully logged in!",
                    });
                    navigate(returnTo);
                }
            } else {
                // Check if the account is blocked
                if (result && result.blocked) {
                    setIsUserBlocked(true);
                    setCurrentStep('account-blocked');
                } else {
                    // Just show error toast but stay on the same screen
                    toast({
                        title: "Error",
                        description: "Invalid IPA address. Please try again.",
                        variant: "destructive",
                    });
                    // Clear the IPA field for a new attempt
                    setIpaAddress('');
                }
            }
        } catch (error) {
            console.error('IPA verification error:', error);
            
            // Check if the error indicates that the account is blocked
            if (error?.response?.data?.status === 'blocked' || 
                error?.response?.data?.message?.includes('blocked') || 
                error?.response?.data?.error?.includes('blocked')) {
                setIsUserBlocked(true);
                setCurrentStep('account-blocked');
            } else {
                toast({
                    title: "Error",
                    description: "Failed to verify your IPA address. Please try again.",
                    variant: "destructive",
                });
                // Clear the IPA field for a new attempt but stay on the same screen
                setIpaAddress('');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle IPA verification for default accounts
    const handleDefaultAccountIpaVerification = async (e) => {
        e.preventDefault();

        if (!ipaAddress) {
            toast({
                title: "Error",
                description: "Please enter your IPA address",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Try to login with the provided IPA address
            const result = await login(phoneNumber, ipaAddress);

            if (result && result.success) {
                // If login succeeds, complete the process with the verification code
                if (result.code) {
                    // Pass the user and token directly to avoid race condition
                    await verifyLoginCode(phoneNumber, result.code, {
                        user: result.user,
                        token: result.token
                    });

                    toast({
                        title: "Success",
                        description: "You have been successfully logged in!",
                    });
                    navigate(returnTo);
                }
            } else {
                // Check if the account is blocked
                if (result && result.blocked) {
                    setIsUserBlocked(true);
                    setCurrentStep('account-blocked');
                } else {
                    // Just show error toast but stay on the same screen
                    toast({
                        title: "Error",
                        description: "Invalid IPA address. Please try again.",
                        variant: "destructive",
                    });
                    // Clear the IPA field for a new attempt
                    setIpaAddress('');
                }
            }
        } catch (error) {
            console.error('Default account IPA verification error:', error);
            
            // Check if the error indicates that the account is blocked
            if (error?.response?.data?.status === 'blocked' || 
                error?.response?.data?.message?.includes('blocked') || 
                error?.response?.data?.error?.includes('blocked')) {
                setIsUserBlocked(true);
                setCurrentStep('account-blocked');
            } else {
                toast({
                    title: "Error",
                    description: "Failed to verify your IPA address. Please try again.",
                    variant: "destructive",
                });
                // Clear the IPA field for a new attempt but stay on the same screen
                setIpaAddress('');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle account deletion for default accounts
    const handleDeleteAccount = async () => {
        setIsLoading(true);
        try {
            const user: {user_id: number} = await UserService.getUserByPhone(phoneNumber);
            await AuthService.deleteAccount(user.user_id);
            toast({
                title: "Account Deleted",
                description: "Your account has been deleted. You can now register a new account.",
            });
            setCurrentStep('registration');
        } catch (error) {
            console.error('Account deletion error:', error);
            toast({
                title: "Error",
                description: "Failed to delete your account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle registration form submission - Now moves to email verification step
    const handleRegistrationSubmit = async (e) => {
        e.preventDefault();

        if (!firstName || !lastName || !email) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        // Set email for verification and generate a code
        setEmailForVerification(email);
        const code = generateEmailVerificationCode();
        setEmailVerificationCode(code);
        
        await AuthService.sendVerificationCode(email, code);

        // Move to email verification step
        setCurrentStep('email-verification');
    };

    // Handle email verification code submission
    const handleEmailVerificationSubmit = async (code) => {
        if (!code || code.length !== 6) {
            toast({
                title: "Error",
                description: "Please enter the 6-digit verification code",
                variant: "destructive",
            });
            return;
        }

        if (code !== emailVerificationCode) {
            toast({
                title: "Error",
                description: "Incorrect verification code",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Now actually register the user after email verification
            await AuthService.registerUser({
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber,
                email: email
            });

            toast({
                title: "Success",
                description: "Your account has been created successfully!",
            });

            // Auto login after registration
            const result = await login(phoneNumber, ipaAddress);
            if (result && result.success) {
                if (result.code) {
                    await verifyLoginCode(phoneNumber, result.code, {
                        user: result.user,
                        token: result.token
                    });
                }
                navigate(returnTo);
            } else {
                setCurrentStep('ipa-verification');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast({
                title: "Registration Failed",
                description: error.response?.data?.error|| error.response?.data?.message  || "Could not create your account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle resend verification code
    const handleResendCode = () => {
        setIsLoading(true);
        setTimeout(() => {
            const newPin = generatePin();
            setVerificationPin(newPin);
            toast({
                title: "Code Resent",
                description: "A new verification code has been sent to your phone",
            });
            setIsLoading(false);
        }, 1000);
    };

    // Handle resend email verification code
    const handleResendEmailCode = () => {
        setIsLoading(true);
        setTimeout(async () => {
            const newCode = generateEmailVerificationCode();
            setEmailVerificationCode(newCode);
            await AuthService.sendVerificationCode(email, newCode);
            toast({
                title: "Code Resent",
                description: `A new verification code has been sent to ${emailForVerification}`,
            });
            setIsLoading(false);
        }, 1000);
    };

    // Handle going back to previous step
    const handleBack = () => {
        if (currentStep === 'phone-verification') {
            setCurrentStep('phone-entry');
        } else if (currentStep === 'email-verification') {
            setCurrentStep('registration');
        } else if (currentStep === 'default-account' || currentStep === 'ipa-verification' || currentStep === 'registration') {
            setCurrentStep('phone-verification');
        } else if (currentStep === 'account-blocked') {
            // Allow users to go back to phone entry from blocked screen
            setCurrentStep('phone-entry');
            setIsUserBlocked(false);
        }
    };

    const DeleteAccountDialog = ({ phoneNumber, onDelete, isLoading }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [deleteConfirmation, setDeleteConfirmation] = useState('');
        const { toast } = useToast();

        const handleDelete = async () => {
            if (deleteConfirmation !== phoneNumber) {
                toast({
                    title: "Error",
                    description: "Please enter your phone number correctly to confirm",
                    variant: "destructive",
                });
                return;
            }

            // Close the dialog and call the parent's delete handler
            setIsOpen(false);
            onDelete();
        };

        // Reset confirmation when dialog closes
        const handleOpenChange = (open) => {
            if (!open) {
                setDeleteConfirmation('');
            }
            setIsOpen(open);
        };

        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        variant="destructive"
                        className="w-full"
                        disabled={isLoading}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Account Confirmation</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. All your data will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <p className="text-sm">
                            To confirm, please enter your phone number: <span className="font-bold">{phoneNumber}</span>
                        </p>
                        <Input
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading || deleteConfirmation !== phoneNumber}
                        >
                            {isLoading ? 'Processing...' : 'Permanently Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link to="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-falsopay-primary">FalsoPay</h1>
                    </Link>
                </div>

                <Card className="animate-fade-in">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">
                            {currentStep === 'phone-entry' ? "Welcome to FalsoPay" : null}
                            {currentStep === 'phone-verification' ? "Verify Your Phone" : null}
                            {currentStep === 'email-verification' ? "Verify Your Email" : null}
                            {currentStep === 'ipa-verification' ? "Login to Your Account" : null}
                            {currentStep === 'default-account' ? "Verify Your Account" : null}
                            {currentStep === 'registration' ? "Create Your Account" : null}
                            {currentStep === 'account-blocked' ? "Account Blocked" : null}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {currentStep === 'phone-entry' ? "Enter your phone number to get started" : null}
                            {currentStep === 'phone-verification' ? "Enter the verification code sent to your phone" : null}
                            {currentStep === 'email-verification' ? "Enter the verification code sent to your email" : null}
                            {currentStep === 'ipa-verification' ? "Enter your IPA address to login" : null}
                            {currentStep === 'default-account' ? "Verify your IPA address or reset your account" : null}
                            {currentStep === 'registration' ? "Fill in your details to create an account" : null}
                            {currentStep === 'account-blocked' ? "Your account has been blocked by an administrator" : null}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {currentStep === 'account-blocked' ? (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="bg-red-100 rounded-full p-3 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 100-6 3 3 0 000 6z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-center text-red-600 font-medium mb-4">
                                        Your account has been blocked by an administrator.
                                    </p>
                                    <p className="text-center text-gray-600 mb-6">
                                        If you believe this is an error or to request your account to be unblocked, 
                                        please contact our support team for assistance.
                                    </p>
                                    <div className="flex flex-col space-y-3 w-full">
                                        <Link to="/public-support">
                                            <Button variant="outline" className="w-full">
                                                Contact Support
                                            </Button>
                                        </Link>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={handleBack}
                                        >
                                            Back
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        
                        {currentStep === 'phone-entry' ? (
                            <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        placeholder="Enter your phone number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Processing...' : 'Continue'}
                                </Button>
                            </form>
                        ) : null}

                        {currentStep === 'phone-verification' ? (
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-gray-500">
                                        Verification code sent to: {phoneNumber}
                                    </p>
                                </div>

                                <div className="w-full flex justify-center">
                                    <PinVerification
                                        onPinSubmit={handleVerificationSubmit}
                                        isLoading={isLoading}
                                        title="Enter Verification Code"
                                        maxLength={4}
                                        expectedPin={verificationPin}
                                        onResend={handleResendCode}
                                    />
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full mt-4"
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                            </div>
                        ) : null}

                        {currentStep === 'email-verification' ? (
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-gray-500">
                                        Verification code sent to: {emailForVerification}
                                    </p>
                                </div>

                                <div className="w-full flex justify-center">
                                    <PinVerification
                                        onPinSubmit={handleEmailVerificationSubmit}
                                        isLoading={isLoading}
                                        title="Enter Email Verification Code"
                                        maxLength={6}
                                        expectedPin={emailVerificationCode}
                                        onResend={handleResendEmailCode}
                                    />
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full mt-4"
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                            </div>
                        ) : null}

                        {currentStep === 'ipa-verification' ? (
                            <form onSubmit={handleIpaVerification} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ipaAddress">IPA Address</Label>
                                    <Input
                                        id="ipaAddress"
                                        placeholder="Enter your IPA address"
                                        value={ipaAddress}
                                        onChange={(e) => setIpaAddress(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                            </form>
                        ) : null}

                        {currentStep === 'default-account' ? (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Your phone number was used before and requires additional verification. You can either enter any of your IPA addresses to verify or reset your account.
                                    </p>
                                </div>

                                <form onSubmit={handleDefaultAccountIpaVerification} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ipaAddress">IPA Address</Label>
                                        <Input
                                            id="ipaAddress"
                                            placeholder="Enter your IPA address"
                                            value={ipaAddress}
                                            onChange={(e) => setIpaAddress(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Verifying...' : 'Verify IPA Address'}
                                    </Button>
                                </form>

                                <div className="flex flex-col space-y-4 pt-4 border-t">
                                    <p className="text-sm text-gray-500 text-center">
                                        Or delete your account and start fresh
                                    </p>

                                    <DeleteAccountDialog
                                        phoneNumber={phoneNumber}
                                        onDelete={handleDeleteAccount}
                                        isLoading={isLoading}
                                    />

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleBack}
                                    >
                                        Back
                                    </Button>
                                </div>
                            </div>
                        ) : null}

                        {currentStep === 'registration' ? (
                            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="Enter your first name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Enter your last name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Processing...' : 'Continue'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                            </form>
                        ) : null}
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-center text-sm">
                            {currentStep === 'phone-entry' && (
                                <p>Need assistance? <Link to="/public-support" className="text-falsopay-primary hover:underline">Contact Support</Link></p>
                            )}
                        </div>
                    </CardFooter>
                </Card>

                <div className="text-center">
                    <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AuthFlow;