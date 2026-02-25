"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Lock,
  Check,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAdminRoles, useAdminPermissions } from "@/hooks/use-api";

export default function AdminRolesPage() {
  const { data: roles, isLoading: rolesLoading } = useAdminRoles();
  const { data: permissions, isLoading: permissionsLoading } = useAdminPermissions();

  const [editingRole, setEditingRole] = useState<{ id: string; name: string; description: string; isSystem: boolean } | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  const isLoading = rolesLoading || permissionsLoading;

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    if (!permissions) return {};
    const grouped: Record<string, Array<{ id: string; name: string; module: string }>> = {};
    for (const perm of permissions) {
      const module = perm.module || "Other";
      if (!grouped[module]) grouped[module] = [];
      grouped[module].push(perm);
    }
    return grouped;
  }, [permissions]);

  const handleEditRole = (role: { id: string; name: string; description: string; isSystem: boolean }) => {
    setEditingRole(role);
    // We don't have per-role permissions from the API yet, start empty
    setEditPermissions([]);
  };

  const togglePermission = (permission: string) => {
    setEditPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSavePermissions = () => {
    // TODO: Wire to API when role permission update endpoint is available
    console.log(
      `Updating role ${editingRole?.id} with permissions:`,
      editPermissions
    );
    setEditingRole(null);
  };

  const handleCreateRole = () => {
    // TODO: Wire to API when role creation endpoint is available
    console.log("Creating role:", {
      name: newRoleName,
      description: newRoleDescription,
    });
    setIsCreateOpen(false);
    setNewRoleName("");
    setNewRoleDescription("");
  };

  const handleDeleteRole = (roleId: string) => {
    // TODO: Wire to API when role deletion endpoint is available
    console.log(`Deleting role ${roleId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Role Management
          </h2>
          <p className="text-muted-foreground">
            Manage roles and their permissions across the platform.
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Role Management
          </h2>
          <p className="text-muted-foreground">
            Manage roles and their permissions across the platform.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with a name and description. You can assign
                permissions after creation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  placeholder="e.g. CONTENT_MODERATOR"
                  value={newRoleName}
                  onChange={(e) =>
                    setNewRoleName(e.target.value.toUpperCase().replace(/\s+/g, "_"))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <Textarea
                  id="roleDescription"
                  placeholder="Describe what this role can do..."
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRole}
                disabled={!newRoleName.trim()}
              >
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty state */}
      {(!roles || roles.length === 0) ? (
        <div className="text-center py-20">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">
            No roles found. Create one to get started.
          </p>
        </div>
      ) : (
        /* Roles grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary shrink-0" />
                    <CardTitle className="text-base">{role.name}</CardTitle>
                  </div>
                  {role.isSystem && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      <Lock className="mr-1 h-3 w-3" />
                      System
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Role ID: <span className="font-mono text-xs">{role.id}</span>
                </p>
              </CardContent>
              <CardFooter className="pt-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditRole(role)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Permissions
                </Button>
                {!role.isSystem && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRole(role.id)}
                    className="text-red-600 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Permissions Dialog */}
      <Dialog
        open={!!editingRole}
        onOpenChange={(open) => !open && setEditingRole(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Permissions - {editingRole?.name}
            </DialogTitle>
            <DialogDescription>
              {editingRole?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {Object.entries(permissionsByModule).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No permissions available.
              </p>
            ) : (
              Object.entries(permissionsByModule).map(([module, perms]) => (
                <div key={module}>
                  <h4 className="text-sm font-semibold mb-3">{module}</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {perms.map((perm) => {
                      const isChecked = editPermissions.includes(perm.name);
                      return (
                        <button
                          key={perm.id}
                          type="button"
                          onClick={() => togglePermission(perm.name)}
                          className={`flex items-center gap-2 rounded-md border p-3 text-left text-sm transition-colors ${
                            isChecked
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                              isChecked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/30"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3" />}
                          </div>
                          <span className="font-mono text-xs">{perm.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRole(null)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions}>
              Save Permissions ({editPermissions.length} selected)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
