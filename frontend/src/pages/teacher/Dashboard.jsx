import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Checkbox } from "../../components/ui/checkbox";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import {
  LogOut,
  GraduationCap,
  Plus,
  Trash2,
  Edit,
  Users,
  FileText,
  ClipboardList,
} from "lucide-react";
import {
  getToetsen,
  addToets,
  updateToets,
  deleteToets,
  getGroepen,
  addGroep,
  updateGroep,
  deleteGroep,
  getUsers,
  getToewijzingen,
  addToewijzing,
  generateId,
} from "../../services/storageService";
export function DocentDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [toetsen, setToetsen] = useState([]);
  const [groepen, setGroepen] = useState([]);
  const [selectedToets, setSelectedToets] = useState(null);
  const [selectedGroep, setSelectedGroep] = useState(null);
  const [isToetsDialogOpen, setIsToetsDialogOpen] = useState(false);
  const [isGroepDialogOpen, setIsGroepDialogOpen] = useState(false);
  const [isVraagDialogOpen, setIsVraagDialogOpen] = useState(false);
  const [isSectieDialogOpen, setIsSectieDialogOpen] = useState(false);
  const [isToewijzingDialogOpen, setIsToewijzingDialogOpen] = useState(false);
  const [editingSectie, setEditingSectie] = useState(null);

  // Form states
  const [toetsForm, setToetsForm] = useState({
    titel: "",
    beschrijving: "",
    algemeen: false,
  });
  const [groepForm, setGroepForm] = useState({ naam: "", beschrijving: "" });
  const [sectieForm, setSectieForm] = useState({
    titel: "",
    nieuweBladzijde: false,
  });
  const [vraagForm, setVraagForm] = useState({
    tekst: "",
    antwoorden: [{ tekst: "", isCorrect: false }],
  });
  const [toewijzingForm, setToewijzingForm] = useState({
    toetsId: "",
    type: "groep",
    groepId: "",
    studentId: "",
    startDatum: "",
    eindDatum: "",
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== "docent") {
      navigate("/");
      return;
    }
    loadData();
  }, [currentUser, navigate]);

  const loadData = () => {
    const allToetsen = getToetsen().filter(
      (t) => t.docentId === currentUser?.id,
    );
    setToetsen(allToetsen);
    const allGroepen = getGroepen().filter(
      (g) => g.docentId === currentUser?.id,
    );
    setGroepen(allGroepen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Toets operations
  const handleCreateToets = () => {
    if (!toetsForm.titel) {
      toast.error("Vul de titel in");
      return;
    }

    const newToets = {
      id: generateId(),
      titel: toetsForm.titel,
      beschrijving: toetsForm.beschrijving,
      docentId: currentUser.id,
      algemeen: toetsForm.algemeen,
      secties: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addToets(newToets);
    toast.success("Toets aangemaakt");
    setToetsForm({ titel: "", beschrijving: "", algemeen: false });
    setIsToetsDialogOpen(false);
    loadData();
  };

  const handleDeleteToets = (toetsId) => {
    deleteToets(toetsId);
    toast.success("Toets verwijderd");
    if (selectedToets?.id === toetsId) {
      setSelectedToets(null);
    }
    loadData();
  };

  const handleUpdateToets = (toets) => {
    updateToets(toets.id, { ...toets, updatedAt: new Date().toISOString() });
    loadData();
    setSelectedToets(getToetsen().find((t) => t.id === toets.id) || null);
  };

  // Sectie operations
  const handleAddSectie = () => {
    if (!selectedToets || !sectieForm.titel) {
      toast.error("Vul de titel in");
      return;
    }

    const newSectie = {
      id: generateId(),
      titel: sectieForm.titel,
      nieuweBladzijde: sectieForm.nieuweBladzijde,
      volgorde: selectedToets.secties.length,
      vragen: [],
    };

    const updatedToets = {
      ...selectedToets,
      secties: [...selectedToets.secties, newSectie],
    };

    handleUpdateToets(updatedToets);
    setSectieForm({ titel: "", nieuweBladzijde: false });
    setIsSectieDialogOpen(false);
    toast.success("Sectie toegevoegd");
  };

  const handleDeleteSectie = (sectieId) => {
    if (!selectedToets) return;

    const updatedToets = {
      ...selectedToets,
      secties: selectedToets.secties.filter((s) => s.id !== sectieId),
    };

    handleUpdateToets(updatedToets);
    toast.success("Sectie verwijderd");
  };

  // Vraag operations
  const handleAddVraag = (sectieId) => {
    if (!selectedToets || !vraagForm.tekst) {
      toast.error("Vul de vraagtekst in");
      return;
    }

    if (vraagForm.antwoorden.some((a) => !a.tekst)) {
      toast.error("Vul alle antwoorden in");
      return;
    }

    if (!vraagForm.antwoorden.some((a) => a.isCorrect)) {
      toast.error("Markeer minstens één correct antwoord");
      return;
    }

    const sectie = selectedToets.secties.find((s) => s.id === sectieId);
    if (!sectie) return;

    const newVraag = {
      id: generateId(),
      tekst: vraagForm.tekst,
      volgorde: sectie.vragen.length,
      antwoorden: vraagForm.antwoorden.map((a) => ({
        id: generateId(),
        tekst: a.tekst,
        isCorrect: a.isCorrect,
      })),
    };

    const updatedSectie = {
      ...sectie,
      vragen: [...sectie.vragen, newVraag],
    };

    const updatedToets = {
      ...selectedToets,
      secties: selectedToets.secties.map((s) =>
        s.id === sectieId ? updatedSectie : s,
      ),
    };

    handleUpdateToets(updatedToets);
    setVraagForm({ tekst: "", antwoorden: [{ tekst: "", isCorrect: false }] });
    setIsVraagDialogOpen(false);
    setEditingSectie(null);
    toast.success("Vraag toegevoegd");
  };

  const handleDeleteVraag = (sectieId, vraagId) => {
    if (!selectedToets) return;

    const updatedToets = {
      ...selectedToets,
      secties: selectedToets.secties.map((s) =>
        s.id === sectieId
          ? { ...s, vragen: s.vragen.filter((v) => v.id !== vraagId) }
          : s,
      ),
    };

    handleUpdateToets(updatedToets);
    toast.success("Vraag verwijderd");
  };

  // Groep operations
  const handleCreateGroep = () => {
    if (!groepForm.naam) {
      toast.error("Vul de groepsnaam in");
      return;
    }

    const newGroep = {
      id: generateId(),
      naam: groepForm.naam,
      beschrijving: groepForm.beschrijving,
      docentId: currentUser.id,
      studentIds: [],
      createdAt: new Date().toISOString(),
    };

    addGroep(newGroep);
    toast.success("Groep aangemaakt");
    setGroepForm({ naam: "", beschrijving: "" });
    setIsGroepDialogOpen(false);
    loadData();
  };

  const handleDeleteGroep = (groepId) => {
    deleteGroep(groepId);
    toast.success("Groep verwijderd");
    if (selectedGroep?.id === groepId) {
      setSelectedGroep(null);
    }
    loadData();
  };

  const handleToggleStudentInGroep = (groepId, studentId) => {
    const groep = groepen.find((g) => g.id === groepId);
    if (!groep) return;

    const studentIds = groep.studentIds.includes(studentId)
      ? groep.studentIds.filter((id) => id !== studentId)
      : [...groep.studentIds, studentId];

    updateGroep(groepId, { studentIds });
    loadData();
    if (selectedGroep?.id === groepId) {
      setSelectedGroep(getGroepen().find((g) => g.id === groepId) || null);
    }
  };

  // Toewijzing operations
  const handleCreateToewijzing = () => {
    if (
      !toewijzingForm.toetsId ||
      !toewijzingForm.startDatum ||
      !toewijzingForm.eindDatum
    ) {
      toast.error("Vul alle velden in");
      return;
    }

    if (toewijzingForm.type === "groep" && !toewijzingForm.groepId) {
      toast.error("Selecteer een groep");
      return;
    }

    if (toewijzingForm.type === "student" && !toewijzingForm.studentId) {
      toast.error("Selecteer een student");
      return;
    }

    const newToewijzing = {
      id: generateId(),
      toetsId: toewijzingForm.toetsId,
      groepId:
        toewijzingForm.type === "groep" ? toewijzingForm.groepId : undefined,
      studentId:
        toewijzingForm.type === "student"
          ? toewijzingForm.studentId
          : undefined,
      startDatum: toewijzingForm.startDatum,
      eindDatum: toewijzingForm.eindDatum,
      createdAt: new Date().toISOString(),
    };

    addToewijzing(newToewijzing);
    toast.success("Toets toegewezen");
    setToewijzingForm({
      toetsId: "",
      type: "groep",
      groepId: "",
      studentId: "",
      startDatum: "",
      eindDatum: "",
    });
    setIsToewijzingDialogOpen(false);
  };

  const allStudents = getUsers().filter((u) => u.role === "student");

  if (!currentUser || currentUser.role !== "docent") {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-violet-50 to-cyan-50 pattern-grid">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-br from-purple-600 to-violet-700 p-2 rounded-xl shadow-lg">
              <GraduationCap className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-linear-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent">
                Docent Dashboard
              </h1>
              <p className="text-sm text-gray-700">{currentUser.naam}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-purple-300 hover:bg-purple-50"
          >
            <LogOut className="size-4 mr-2" />
            Uitloggen
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="toetsen" className="space-y-4">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-purple-200">
            <TabsTrigger
              value="toetsen"
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white"
            >
              <FileText className="size-4 mr-2" />
              Toetsen
            </TabsTrigger>
            <TabsTrigger
              value="groepen"
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white"
            >
              <Users className="size-4 mr-2" />
              Groepen
            </TabsTrigger>
            <TabsTrigger
              value="toewijzingen"
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white"
            >
              <ClipboardList className="size-4 mr-2" />
              Toewijzingen
            </TabsTrigger>
          </TabsList>

          {/* Toetsen Tab */}
          <TabsContent value="toetsen" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Toetsen lijst */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Mijn Toetsen</CardTitle>
                      <CardDescription>
                        Overzicht van alle toetsen
                      </CardDescription>
                    </div>
                    <Dialog
                      open={isToetsDialogOpen}
                      onOpenChange={setIsToetsDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="size-4 mr-2" />
                          Nieuw
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nieuwe toets</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Titel</Label>
                            <Input
                              value={toetsForm.titel}
                              onChange={(e) =>
                                setToetsForm({
                                  ...toetsForm,
                                  titel: e.target.value,
                                })
                              }
                              placeholder="Wiskunde Hoofdstuk 3"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Beschrijving</Label>
                            <Textarea
                              value={toetsForm.beschrijving}
                              onChange={(e) =>
                                setToetsForm({
                                  ...toetsForm,
                                  beschrijving: e.target.value,
                                })
                              }
                              placeholder="Toets over..."
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={toetsForm.algemeen}
                              onCheckedChange={(checked) =>
                                setToetsForm({
                                  ...toetsForm,
                                  algemeen: checked,
                                })
                              }
                            />
                            <Label>
                              Algemeen beschikbaar voor alle studenten
                            </Label>
                          </div>
                          <Button
                            onClick={handleCreateToets}
                            className="w-full"
                          >
                            Toets aanmaken
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {toetsen.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Nog geen toetsen aangemaakt
                      </p>
                    ) : (
                      toetsen.map((toets) => (
                        <div
                          key={toets.id}
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedToets?.id === toets.id
                              ? "bg-indigo-50 border-indigo-300"
                              : ""
                          }`}
                          onClick={() => setSelectedToets(toets)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{toets.titel}</h4>
                              <p className="text-sm text-gray-600">
                                {toets.beschrijving}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                  {toets.secties.length} secties
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                  {toets.secties.reduce(
                                    (acc, s) => acc + s.vragen.length,
                                    0,
                                  )}{" "}
                                  vragen
                                </span>
                                {toets.algemeen && (
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                    Algemeen
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteToets(toets.id);
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Toets details */}
              <Card>
                <CardHeader>
                  <CardTitle>Toets details</CardTitle>
                  <CardDescription>
                    {selectedToets
                      ? selectedToets.titel
                      : "Selecteer een toets om te bewerken"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedToets ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Secties</h4>
                        <Dialog
                          open={isSectieDialogOpen}
                          onOpenChange={setIsSectieDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="size-4 mr-2" />
                              Sectie
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Nieuwe sectie</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Titel</Label>
                                <Input
                                  value={sectieForm.titel}
                                  onChange={(e) =>
                                    setSectieForm({
                                      ...sectieForm,
                                      titel: e.target.value,
                                    })
                                  }
                                  placeholder="Deel 1: Meetkunde"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={sectieForm.nieuweBladzijde}
                                  onCheckedChange={(checked) =>
                                    setSectieForm({
                                      ...sectieForm,
                                      nieuweBladzijde: checked,
                                    })
                                  }
                                />
                                <Label>Start op nieuwe pagina</Label>
                              </div>
                              <Button
                                onClick={handleAddSectie}
                                className="w-full"
                              >
                                Sectie toevoegen
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {selectedToets.secties.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Nog geen secties toegevoegd
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {selectedToets.secties.map((sectie) => (
                            <div
                              key={sectie.id}
                              className="border rounded-lg p-3"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="font-medium">
                                    {sectie.titel}
                                  </h5>
                                  {sectie.nieuweBladzijde && (
                                    <span className="text-xs text-gray-500">
                                      Nieuwe pagina
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Dialog
                                    open={
                                      isVraagDialogOpen &&
                                      editingSectie?.id === sectie.id
                                    }
                                    onOpenChange={(open) => {
                                      setIsVraagDialogOpen(open);
                                      if (open) setEditingSectie(sectie);
                                      else setEditingSectie(null);
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Plus className="size-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Vraag toevoegen
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                          <Label>Vraagtekst</Label>
                                          <Textarea
                                            value={vraagForm.tekst}
                                            onChange={(e) =>
                                              setVraagForm({
                                                ...vraagForm,
                                                tekst: e.target.value,
                                              })
                                            }
                                            placeholder="Wat is 2 + 2?"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Label>Antwoorden</Label>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() =>
                                                setVraagForm({
                                                  ...vraagForm,
                                                  antwoorden: [
                                                    ...vraagForm.antwoorden,
                                                    {
                                                      tekst: "",
                                                      isCorrect: false,
                                                    },
                                                  ],
                                                })
                                              }
                                            >
                                              <Plus className="size-4" />
                                            </Button>
                                          </div>
                                          {vraagForm.antwoorden.map(
                                            (antwoord, index) => (
                                              <div
                                                key={index}
                                                className="flex gap-2 items-center"
                                              >
                                                <Checkbox
                                                  checked={antwoord.isCorrect}
                                                  onCheckedChange={(
                                                    checked,
                                                  ) => {
                                                    const newAntwoorden = [
                                                      ...vraagForm.antwoorden,
                                                    ];
                                                    newAntwoorden[
                                                      index
                                                    ].isCorrect = checked;
                                                    setVraagForm({
                                                      ...vraagForm,
                                                      antwoorden: newAntwoorden,
                                                    });
                                                  }}
                                                />
                                                <Input
                                                  value={antwoord.tekst}
                                                  onChange={(e) => {
                                                    const newAntwoorden = [
                                                      ...vraagForm.antwoorden,
                                                    ];
                                                    newAntwoorden[index].tekst =
                                                      e.target.value;
                                                    setVraagForm({
                                                      ...vraagForm,
                                                      antwoorden: newAntwoorden,
                                                    });
                                                  }}
                                                  placeholder="Antwoord"
                                                />
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => {
                                                    setVraagForm({
                                                      ...vraagForm,
                                                      antwoorden:
                                                        vraagForm.antwoorden.filter(
                                                          (_, i) => i !== index,
                                                        ),
                                                    });
                                                  }}
                                                >
                                                  <Trash2 className="size-4" />
                                                </Button>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                        <Button
                                          onClick={() =>
                                            handleAddVraag(sectie.id)
                                          }
                                          className="w-full"
                                        >
                                          Vraag toevoegen
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteSectie(sectie.id)
                                    }
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </div>

                              {sectie.vragen.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                  Geen vragen
                                </p>
                              ) : (
                                <div className="space-y-2 mt-2">
                                  {sectie.vragen.map((vraag, index) => (
                                    <div
                                      key={vraag.id}
                                      className="bg-gray-50 p-2 rounded text-sm"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="font-medium">
                                            {index + 1}. {vraag.tekst}
                                          </p>
                                          <div className="mt-1 space-y-1">
                                            {vraag.antwoorden.map(
                                              (antwoord) => (
                                                <div
                                                  key={antwoord.id}
                                                  className={`text-xs ${
                                                    antwoord.isCorrect
                                                      ? "text-green-700 font-medium"
                                                      : "text-gray-600"
                                                  }`}
                                                >
                                                  • {antwoord.tekst}
                                                  {antwoord.isCorrect && " ✓"}
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteVraag(
                                              sectie.id,
                                              vraag.id,
                                            )
                                          }
                                        >
                                          <Trash2 className="size-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      Selecteer een toets om te bewerken
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Groepen Tab */}
          <TabsContent value="groepen" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Mijn Groepen</CardTitle>
                      <CardDescription>
                        Beheer groepen en studenten
                      </CardDescription>
                    </div>
                    <Dialog
                      open={isGroepDialogOpen}
                      onOpenChange={setIsGroepDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="size-4 mr-2" />
                          Nieuw
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nieuwe groep</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Naam</Label>
                            <Input
                              value={groepForm.naam}
                              onChange={(e) =>
                                setGroepForm({
                                  ...groepForm,
                                  naam: e.target.value,
                                })
                              }
                              placeholder="Klas 3A"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Beschrijving</Label>
                            <Textarea
                              value={groepForm.beschrijving}
                              onChange={(e) =>
                                setGroepForm({
                                  ...groepForm,
                                  beschrijving: e.target.value,
                                })
                              }
                              placeholder="Beschrijving..."
                            />
                          </div>
                          <Button
                            onClick={handleCreateGroep}
                            className="w-full"
                          >
                            Groep aanmaken
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {groepen.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Nog geen groepen aangemaakt
                      </p>
                    ) : (
                      groepen.map((groep) => (
                        <div
                          key={groep.id}
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedGroep?.id === groep.id
                              ? "bg-indigo-50 border-indigo-300"
                              : ""
                          }`}
                          onClick={() => setSelectedGroep(groep)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{groep.naam}</h4>
                              <p className="text-sm text-gray-600">
                                {groep.beschrijving}
                              </p>
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded inline-block mt-2">
                                {groep.studentIds.length} studenten
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGroep(groep.id);
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Studenten in groep</CardTitle>
                  <CardDescription>
                    {selectedGroep ? selectedGroep.naam : "Selecteer een groep"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedGroep ? (
                    <div className="space-y-2">
                      {allStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedGroep.studentIds.includes(
                                student.id,
                              )}
                              onCheckedChange={() =>
                                handleToggleStudentInGroep(
                                  selectedGroep.id,
                                  student.id,
                                )
                              }
                            />
                            <div>
                              <p className="text-sm font-medium">
                                {student.naam}
                              </p>
                              <p className="text-xs text-gray-500">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      Selecteer een groep om studenten toe te voegen
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Toewijzingen Tab */}
          <TabsContent value="toewijzingen">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Toets Toewijzingen</CardTitle>
                    <CardDescription>
                      Wijs toetsen toe aan groepen of studenten
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isToewijzingDialogOpen}
                    onOpenChange={setIsToewijzingDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="size-4 mr-2" />
                        Nieuwe toewijzing
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Toets toewijzen</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Toets</Label>
                          <Select
                            value={toewijzingForm.toetsId}
                            onValueChange={(value) =>
                              setToewijzingForm({
                                ...toewijzingForm,
                                toetsId: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecteer toets" />
                            </SelectTrigger>
                            <SelectContent>
                              {toetsen.map((toets) => (
                                <SelectItem key={toets.id} value={toets.id}>
                                  {toets.titel}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Toewijzen aan</Label>
                          <Select
                            value={toewijzingForm.type}
                            onValueChange={(value) =>
                              setToewijzingForm({
                                ...toewijzingForm,
                                type: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="groep">Groep</SelectItem>
                              <SelectItem value="student">
                                Individuele student
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {toewijzingForm.type === "groep" ? (
                          <div className="space-y-2">
                            <Label>Groep</Label>
                            <Select
                              value={toewijzingForm.groepId}
                              onValueChange={(value) =>
                                setToewijzingForm({
                                  ...toewijzingForm,
                                  groepId: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecteer groep" />
                              </SelectTrigger>
                              <SelectContent>
                                {groepen.map((groep) => (
                                  <SelectItem key={groep.id} value={groep.id}>
                                    {groep.naam}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Student</Label>
                            <Select
                              value={toewijzingForm.studentId}
                              onValueChange={(value) =>
                                setToewijzingForm({
                                  ...toewijzingForm,
                                  studentId: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecteer student" />
                              </SelectTrigger>
                              <SelectContent>
                                {allStudents.map((student) => (
                                  <SelectItem
                                    key={student.id}
                                    value={student.id}
                                  >
                                    {student.naam}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>Start datum</Label>
                          <Input
                            type="datetime-local"
                            value={toewijzingForm.startDatum}
                            onChange={(e) =>
                              setToewijzingForm({
                                ...toewijzingForm,
                                startDatum: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Eind datum</Label>
                          <Input
                            type="datetime-local"
                            value={toewijzingForm.eindDatum}
                            onChange={(e) =>
                              setToewijzingForm({
                                ...toewijzingForm,
                                eindDatum: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Button
                          onClick={handleCreateToewijzing}
                          className="w-full"
                        >
                          Toewijzen
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Toets</TableHead>
                      <TableHead>Toegewezen aan</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>Eind</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getToewijzingen()
                      .filter((t) => {
                        const toets = toetsen.find((to) => to.id === t.toetsId);
                        return toets && toets.docentId === currentUser.id;
                      })
                      .map((toewijzing) => {
                        const toets = toetsen.find(
                          (t) => t.id === toewijzing.toetsId,
                        );
                        const groep = toewijzing.groepId
                          ? groepen.find((g) => g.id === toewijzing.groepId)
                          : null;
                        const student = toewijzing.studentId
                          ? allStudents.find(
                              (s) => s.id === toewijzing.studentId,
                            )
                          : null;

                        return (
                          <TableRow key={toewijzing.id}>
                            <TableCell>{toets?.titel}</TableCell>
                            <TableCell>
                              {groep
                                ? `Groep: ${groep.naam}`
                                : student
                                  ? student.naam
                                  : "-"}
                            </TableCell>
                            <TableCell>
                              {new Date(toewijzing.startDatum).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {new Date(toewijzing.eindDatum).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
export default DocentDashboard;
