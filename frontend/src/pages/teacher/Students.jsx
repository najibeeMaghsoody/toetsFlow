
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Search,
  Filter,
  ArrowLeft,
  Users,
  Mail,
  UserCheck,
  Calendar,
  BookOpen,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { LoadingSpinner } from "../../components/teacher/LoadingSpinner";
import {
  getStudents,
  getGroups,
  getAssignments,
  getAllStudentResults,
  getTests,
} from "../../services/teacherService";
import { toast } from "sonner";

export default function TeacherStudents() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [testResults, setTestResults] = useState({}); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    if (user && user.role === "teacher") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsData, groupsData, assignmentsData, allResults] =
        await Promise.all([
          getStudents(),
          getGroups(),
          getAssignments(),
          getAllStudentResults(),
        ]);

      setStudents(studentsData || []);
      setGroups(groupsData || []);
      setAssignments(assignmentsData || []);
      setFilteredStudents(studentsData || []);

   
      const resultsPerStudent = {};


      Object.values(allResults).forEach((testData) => {
        if (testData.students) {
          testData.students.forEach((studentResult) => {
            const studentId = studentResult.student_id;
            if (!resultsPerStudent[studentId]) {
              resultsPerStudent[studentId] = {
                completedCount: 0,
                totalScore: 0,
                attempts: [],
              };
            }
            if (studentResult.completed_at) {
              resultsPerStudent[studentId].completedCount++;
              resultsPerStudent[studentId].totalScore +=
                studentResult.score || 0;
            }
            resultsPerStudent[studentId].attempts.push(studentResult);
          });
        }
      });

      setTestResults(resultsPerStudent);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Fout bij laden van gegevens");
    } finally {
      setLoading(false);
    }
  };


  const loadStudentAttempts = async () => {
    setLoadingResults(true);
    try {
      const tests = await getTests();
      let allAttempts = [];

      for (const test of tests) {
        try {
          const results = await getAllStudentResults();

          Object.values(results).forEach((testData) => {
            if (testData.students) {
              allAttempts = [...allAttempts, ...testData.students];
            }
          });
        } catch (e) {
          console.error(`Error loading results for test ${test.id}:`, e);
        }
      }

     
      const attemptsPerStudent = {};
      allAttempts.forEach((attempt) => {
        if (!attemptsPerStudent[attempt.student_id]) {
          attemptsPerStudent[attempt.student_id] = [];
        }
        attemptsPerStudent[attempt.student_id].push(attempt);
      });

      const updatedResults = { ...testResults };
      Object.keys(attemptsPerStudent).forEach((studentId) => {
        const studentAttempts = attemptsPerStudent[studentId];
        const completedAttempts = studentAttempts.filter((a) => a.completed_at);
        const totalScore = completedAttempts.reduce(
          (sum, a) => sum + (a.score || 0),
          0,
        );

        updatedResults[studentId] = {
          completedCount: completedAttempts.length,
          totalScore: totalScore,
          attempts: studentAttempts,
        };
      });

      setTestResults(updatedResults);
    } catch (error) {
      console.error("Error loading student attempts:", error);
    } finally {
      setLoadingResults(false);
    }
  };


  useEffect(() => {
    let result = [...students];


    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (student) =>
          student.name?.toLowerCase().includes(term) ||
          student.email?.toLowerCase().includes(term),
      );
    }

   
    if (selectedGroup !== "all") {
      const group = groups.find((g) => g.id === parseInt(selectedGroup));
      if (group) {
        const studentIdsInGroup = new Set((group.users || []).map((u) => u.id));
        result = result.filter((student) => studentIdsInGroup.has(student.id));
      }
    }

  
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "name") {
        aVal = a.name?.toLowerCase() || "";
        bVal = b.name?.toLowerCase() || "";
      } else if (sortField === "email") {
        aVal = a.email?.toLowerCase() || "";
        bVal = b.email?.toLowerCase() || "";
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredStudents(result);
  }, [searchTerm, selectedGroup, students, sortField, sortDirection, groups]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleViewDetails = async (student) => {
    setSelectedStudent(student);

  
    setLoadingResults(true);

    try {
      const tests = await getTests();
      const studentAttempts = [];
      let totalCompleted = 0;
      let totalScoreSum = 0;

      for (const test of tests) {
        try {
          const response = await fetch(
            `/api/teacher/tests/${test.id}/results/${student.id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                Accept: "application/json",
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.attempt) {
              studentAttempts.push({
                test_id: test.id,
                test_title: test.title,
                score: data.data.attempt.score,
                max_score: data.data.attempt.max_score,
                percentage: data.data.attempt.percentage,
                completed_at: data.data.attempt.completed_at,
                started_at: data.data.attempt.started_at,
                status: data.data.attempt.completed_at
                  ? "completed"
                  : "in_progress",
              });

              if (data.data.attempt.completed_at) {
                totalCompleted++;
                totalScoreSum += data.data.attempt.score || 0;
              }
            }
          }
        } catch (e) {
          console.error(`Error loading result for test ${test.id}:`, e);
        }
      }

      const averageScore =
        totalCompleted > 0 ? (totalScoreSum / totalCompleted).toFixed(1) : 0;

      setStudentDetails({
        ...student,
        assignments: studentAttempts,
        stats: {
          totalAssignments: studentAttempts.length,
          completedAssignments: totalCompleted,
          averageScore: averageScore,
          totalTests: [...new Set(studentAttempts.map((a) => a.test_id))]
            .length,
        },
      });
    } catch (error) {
      console.error("Error loading student details:", error);
      toast.error("Fout bij laden van student details");
    } finally {
      setLoadingResults(false);
    }

    setIsDetailsOpen(true);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-3 h-3 ml-1 inline" />
    ) : (
      <ChevronDown className="w-3 h-3 ml-1 inline" />
    );
  };


  const getStudentStats = (studentId) => {
    const results = testResults[studentId];
    if (!results) {
      return { totalAssignments: 0, completedCount: 0, averageScore: "-" };
    }

    const totalAssignments = results.attempts?.length || 0;
    const completedCount = results.completedCount || 0;
    const averageScore =
      completedCount > 0
        ? (results.totalScore / completedCount).toFixed(1)
        : "-";

    return { totalAssignments, completedCount, averageScore };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Studenten</h1>
              <p className="text-gray-500 mt-1">
                Beheer en bekijk alle studenten, hun groepen en toetsresultaten
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/teacher/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Dashboard
            </Button>
          </div>
        </div>

        {/* Statistieken */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Totaal Studenten
              </CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-gray-500">
                {groups.length} groepen beschikbaar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Actieve Toewijzingen
              </CardTitle>
              <BookOpen className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  assignments.filter((a) => new Date(a.end_date) > new Date())
                    .length
                }
              </div>
              <p className="text-xs text-gray-500">
                {assignments.length} totaal toegewezen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Gemiddelde Score
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(() => {
                  let totalScore = 0;
                  let completedCount = 0;

                  Object.values(testResults).forEach((result) => {
                    if (result.completedCount > 0) {
                      totalScore += result.totalScore;
                      completedCount += result.completedCount;
                    }
                  });

                  if (completedCount === 0) return "0%";
                  const avg = (totalScore / completedCount).toFixed(1);
                  return `${avg}%`;
                })()}
              </div>
              <p className="text-xs text-gray-500">
                Over alle voltooide toetsen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Voltooiingspercentage
              </CardTitle>
              <UserCheck className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(() => {
                  let totalAttempts = 0;
                  let completedAttempts = 0;

                  Object.values(testResults).forEach((result) => {
                    totalAttempts += result.attempts?.length || 0;
                    completedAttempts += result.completedCount || 0;
                  });

                  if (totalAttempts === 0) return "0%";
                  const percentage = (completedAttempts / totalAttempts) * 100;
                  return `${percentage.toFixed(1)}%`;
                })()}
              </div>
              <p className="text-xs text-gray-500">
                Van alle toegewezen toetsen
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Zoek op naam of email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative w-full sm:w-64">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="all">Alle groepen</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Studenten Tabel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  Naam <SortIcon field="name" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("email")}
                >
                  Email <SortIcon field="email" />
                </TableHead>
                <TableHead>Groepen</TableHead>
                <TableHead>Toegewezen Toetsen</TableHead>
                <TableHead>Voltooid</TableHead>
                <TableHead>Gem. Score</TableHead>
                <TableHead className="text-center">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    Geen studenten gevonden
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const stats = getStudentStats(student.id);
                  const studentAssignmentsCount = assignments.filter(
                    (a) => a.user_id === student.id,
                  ).length;

                  const totalAssignments = Math.max(
                    stats.totalAssignments,
                    studentAssignmentsCount,
                  );

                  // Vind groepen waar student in zit
                  const studentGroups = groups.filter((group) =>
                    (group.users || []).some((u) => u.id === student.id),
                  );

                  return (
                    <TableRow key={student.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {student.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {studentGroups.length > 0 ? (
                            studentGroups.slice(0, 2).map((group) => (
                              <Badge
                                key={group.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {group.name.length > 20
                                  ? group.name.substring(0, 20) + "..."
                                  : group.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Geen groep
                            </span>
                          )}
                          {studentGroups.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{studentGroups.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{totalAssignments}</TableCell>
                      <TableCell>
                        {stats.completedCount}/{totalAssignments}
                      </TableCell>
                      <TableCell>
                        {stats.averageScore !== "-" ? (
                          <span
                            className={`font-medium ${
                              parseFloat(stats.averageScore) >= 75
                                ? "text-green-600"
                                : parseFloat(stats.averageScore) >= 55
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {stats.averageScore}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(student)}
                          className="hover:bg-indigo-50"
                          disabled={loadingResults}
                        >
                          {loadingResults ? (
                            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4 text-indigo-600" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Student Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Student Details</DialogTitle>
          </DialogHeader>

          {studentDetails && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {studentDetails.name}
                    </h3>
                    <p className="text-gray-600">{studentDetails.email}</p>
                  </div>
                  <div className="bg-indigo-100 rounded-full p-3">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>

              {/* Statistieken */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600">
                    {studentDetails.stats.totalAssignments}
                  </p>
                  <p className="text-sm text-gray-500">Toegewezen toetsen</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {studentDetails.stats.completedAssignments}
                  </p>
                  <p className="text-sm text-gray-500">Voltooide toetsen</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {studentDetails.stats.averageScore}%
                  </p>
                  <p className="text-sm text-gray-500">Gemiddelde score</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {studentDetails.stats.totalTests}
                  </p>
                  <p className="text-sm text-gray-500">Unieke toetsen</p>
                </div>
              </div>

              {/* Toegewezen Toetsen */}
              {studentDetails.assignments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Toetsresultaten
                  </h4>
                  <div className="space-y-2">
                    {studentDetails.assignments.map((assignment, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-3 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {assignment.test_title}
                            </p>
                            <p className="text-sm text-gray-500">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              Gestart:{" "}
                              {assignment.started_at
                                ? new Date(
                                    assignment.started_at,
                                  ).toLocaleDateString("nl-NL")
                                : "Niet gestart"}
                            </p>
                          </div>
                          <div className="text-right">
                            {assignment.completed_at ? (
                              <Badge className="bg-green-100 text-green-800">
                                Score: {assignment.score}/{assignment.max_score}{" "}
                                ({assignment.percentage?.toFixed(1)}%)
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                In uitvoering
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actie knoppen */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    navigate(`/teacher/results`);
                  }}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Bekijk alle resultaten
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
