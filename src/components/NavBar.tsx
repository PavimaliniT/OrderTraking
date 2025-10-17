import { useState } from 'react';
import { Package, Menu, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useVillage } from '@/contexts/VillageContext';
import { VillageSwitcher } from '@/components/VillageSwitcher';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/orders', label: 'Orders' },
  { path: '/deliveries', label: 'Deliveries' },
];

export const NavBar = () => {
  const location = useLocation();
  const { activeVillage } = useVillage();
  const [showVillageSwitcher, setShowVillageSwitcher] = useState(false);

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            location.pathname === item.path
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <>
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Smart Order Tracker</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <NavLinks />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setShowVillageSwitcher(true)}
              >
                <MapPin className="h-4 w-4" />
                {activeVillage ? activeVillage : 'Set Village'}
              </Button>
            </div>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  <Button
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => setShowVillageSwitcher(true)}
                  >
                    <MapPin className="h-4 w-4" />
                    {activeVillage ? activeVillage : 'Set Village'}
                  </Button>
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <VillageSwitcher open={showVillageSwitcher} onOpenChange={setShowVillageSwitcher} />
    </>
  );
};
