// components/docent/GroupList.jsx
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Plus, Trash2, Users } from "lucide-react";

export function GroupList({
  groups,
  selectedGroup,
  onSelectGroup,
  onDeleteGroup,
  onOpenDialog,
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mijn Groepen</CardTitle>
            <CardDescription>Beheer groepen en studenten</CardDescription>
          </div>
          <Button size="sm" onClick={onOpenDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nieuw
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {groups.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Geen groepen aangemaakt
            </p>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedGroup?.id === group.id
                    ? "bg-indigo-50 border-indigo-300"
                    : ""
                }`}
                onClick={() => onSelectGroup(group)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{group.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {group.description || "No description"}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Users className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {group.users?.length || 0} studenten
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteGroup(group.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
