import React from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { signInWithGoogle, signOutUser } from '../../services/firebase';
import { User } from 'firebase/auth';
import { ChevronDown, LogOut } from 'lucide-react';

interface AuthButtonProps {
  user: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({ user, onSignIn, onSignOut }) => {
  const handleSignIn = async () => {
    try {
      console.log('AuthButton: Sign in button clicked');
      await signInWithGoogle();
      onSignIn?.();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      onSignOut?.();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 p-2 h-auto border border-border hover:border-primary/80 transition-all duration-200"
          >
            <Avatar className="h-8 w-8 border-2 border-primary/50">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background backdrop-blur-sm border-border">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-foreground">
                {user.displayName || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      onClick={handleSignIn}
      className="text-sm font-medium"
    >
      Sign In with Google
    </Button>
  );
};

export default AuthButton;
