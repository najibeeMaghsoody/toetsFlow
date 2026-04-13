
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Plus, Trash2, Pencil, Users, ChevronRight } from "lucide-react";

export function GroupList({
  groups,
  selectedGroup,
  onSelectGroup,
  onDeleteGroup,
  onEditGroup,
  onOpenDialog,
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Mijn Groepen
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Beheer groepen en studenten
            </CardDescription>
          </div>
          <Button
            onClick={onOpenDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Groep
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Geen groepen aangemaakt</p>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenDialog}
                className="mt-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Eerste Groep Aanmaken
              </Button>
            </div>
          ) : (
            groups.map((group) => {
              const studentCount = group.users?.length || 0;
              const isSelected = selectedGroup?.id === group.id;

              return (
                <div
                  key={group.id}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-300 shadow-md"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => onSelectGroup(group)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {group.name}
                        </h4>
                        {isSelected && (
                          <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                            Geselecteerd
                          </span>
                        )}
                      </div>
                      {group.description && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                          {group.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {studentCount} student{studentCount !== 1 ? "en" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditGroup(group);
                        }}
                        className="text-gray-500 hover:text-indigo-600"
                        title="Groep bewerken"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteGroup(group.id);
                        }}
                        className="text-gray-500 hover:text-red-600"
                        title="Groep verwijderen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight
                        className={`w-5 h-5 transition-colors ${
                          isSelected ? "text-indigo-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
