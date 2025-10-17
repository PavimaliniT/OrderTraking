import { useState } from 'react';
import { useVillage } from '@/contexts/VillageContext';
import { useOrders } from '@/contexts/OrderContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface VillageSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VillageSwitcher = ({ open, onOpenChange }: VillageSwitcherProps) => {
  const { activeVillage, setActiveVillage } = useVillage();
  const { orders } = useOrders();
  const [selectedVillage, setSelectedVillage] = useState(activeVillage);
  const [newVillage, setNewVillage] = useState('');
  const [mode, setMode] = useState<'select' | 'new'>('select');

  // Get unique village names from existing orders
  const villages = Array.from(new Set(orders.map(order => order.villageName))).sort();

  const handleSetVillage = () => {
    const villageToSet = mode === 'new' ? newVillage.trim() : selectedVillage;
    
    if (!villageToSet) {
      toast.error('Please enter or select a village name');
      return;
    }

    setActiveVillage(villageToSet);
    toast.success(`Active village set to: ${villageToSet}`);
    onOpenChange(false);
    setNewVillage('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch Active Village</DialogTitle>
          <DialogDescription>
            Select a village from previous orders or add a new one
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={mode === 'select' ? 'default' : 'outline'}
              onClick={() => setMode('select')}
              disabled={villages.length === 0}
              className="flex-1"
            >
              Select Existing
            </Button>
            <Button
              variant={mode === 'new' ? 'default' : 'outline'}
              onClick={() => setMode('new')}
              className="flex-1"
            >
              Add New
            </Button>
          </div>

          {mode === 'select' ? (
            <div className="space-y-2">
              <Label htmlFor="village-select">Select Village</Label>
              {villages.length > 0 ? (
                <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                  <SelectTrigger id="village-select">
                    <SelectValue placeholder="Choose a village" />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map((village) => (
                      <SelectItem key={village} value={village}>
                        {village}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No villages found. Add your first village using "Add New" option.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="new-village">New Village Name</Label>
              <Input
                id="new-village"
                placeholder="Enter village name"
                value={newVillage}
                onChange={(e) => setNewVillage(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSetVillage} className="flex-1">
            Set as Active Village
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
