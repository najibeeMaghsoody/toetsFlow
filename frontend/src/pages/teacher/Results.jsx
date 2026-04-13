
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Eye,
  Download,
  Search,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  ArrowLeft,
  BarChart3,
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
import { Progress } from "../../components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { LoadingSpinner } from "../../components/teacher/LoadingSpinner";
import {
  getTests,
  getTestResults,
  exportResultsToCsv,
  getStudentResultDetail,
} from "../../services/teacherService";
import { toast } from "sonner";

export default function TeacherResults() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statistics, setStatistics] = useState(null);


  useEffect(() => {
    if (user && user.role === "teacher") {
      loadTests();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTest) {
      loadResults();
    }
  }, [selectedTest]);

  const loadTests = async () => {
    setLoading(true);
    try {
      const testsData = await getTests();
      setTests(testsData || []);
      if (testsData && testsData.length > 0) {
        setSelectedTest(testsData[0]);
      }
    } catch (error) {
      console.error("Error loading tests:", error);
      toast.error("Fout bij laden van toetsen");
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    if (!selectedTest) return;

    setResultsLoading(true);
    try {
      const data = await getTestResults(selectedTest.id);
      setResults(data);
      calculateStatistics(data);
    } catch (error) {
      console.error("Error loading results:", error);
      toast.error("Fout bij laden resultaten");
    } finally {
      setResultsLoading(false);
    }
  };

  const calculateStatistics = (data) => {
    const completedResults = data.filter((r) => r.status === "completed");
    const scores = completedResults.map((r) => r.percentage);

    if (scores.length === 0) {
      setStatistics({
        totalStudents: data.length,
        completedCount: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
      });
      return;
    }

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passCount = scores.filter((s) => s >= 55).length;
    const passRate = (passCount / scores.length) * 100;

    setStatistics({
      totalStudents: data.length,
      completedCount: completedResults.length,
      averageScore: averageScore.toFixed(1),
      highestScore: highestScore.toFixed(1),
      lowestScore: lowestScore.toFixed(1),
      passRate: passRate.toFixed(1),
    });
  };

  const handleExport = async () => {
    if (!selectedTest) return;
    try {
      await exportResultsToCsv(selectedTest.id);
      toast.success("Export gestart");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Fout bij exporteren");
    }
  };

  const handleViewDetails = async (student) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
    setDetailsLoading(true);

    try {
      const details = await getStudentResultDetail(
        selectedTest.id,
        student.student_id,
      );
      setStudentDetails(details);
    } catch (error) {
      console.error("Error loading student details:", error);
      toast.error("Fout bij laden details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.student_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || result.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status === "completed") {
      return (
        <Badge className="bg-green-100 text-green-800 border-0">
          <CheckCircle className="w-3 h-3 mr-1" /> Voltooid
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-0">
        <Clock className="w-3 h-3 mr-1" /> Bezig
      </Badge>
    );
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 75) return "text-green-600 font-semibold";
    if (percentage >= 55) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resultaten</h1>
              <p className="text-gray-500 mt-1">
                Bekijk en exporteer toetsresultaten per student
              </p>
            </div>
            
          </div>
        </div>

        {/* Test Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecteer toets
          </label>
          <div className="flex flex-wrap gap-3">
            {tests.map((test) => (
              <Button
                key={test.id}
                variant={selectedTest?.id === test.id ? "default" : "outline"}
                onClick={() => setSelectedTest(test)}
                className={
                  selectedTest?.id === test.id
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : ""
                }
              >
                {test.title}
              </Button>
            ))}
            {tests.length === 0 && (
              <p className="text-gray-500">Geen toetsen gevonden</p>
            )}
          </div>
        </div>

        {selectedTest && (
          <>
            {/* Test Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedTest.title}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    {selectedTest.description || "Geen beschrijving"}
                  </p>
                </div>
                <Button onClick={handleExport} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exporteer CSV
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Deelnemers
                    </CardTitle>
                    <Users className="w-4 h-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statistics.totalStudents}
                    </div>
                    <p className="text-xs text-gray-500">
                      {statistics.completedCount} voltooid
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
                      {statistics.averageScore}%
                    </div>
                    <Progress
                      value={statistics.averageScore}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Hoogste Score
                    </CardTitle>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {statistics.highestScore}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Slagingspercentage
                    </CardTitle>
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statistics.passRate}%
                    </div>
                    <p className="text-xs text-gray-500">55% of hoger</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Zoek op naam of email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Alle statussen</option>
                  <option value="completed">Voltooid</option>
                  <option value="in_progress">In uitvoering</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Pogingen</TableHead>
                    <TableHead>Voltooid op</TableHead>
                    <TableHead className="text-center">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultsLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Laden...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        Geen resultaten gevonden
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((result) => (
                      <TableRow
                        key={result.student_id}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">
                          {result.student_name}
                        </TableCell>
                        <TableCell>{result.student_email}</TableCell>
                        <TableCell>{getStatusBadge(result.status)}</TableCell>
                        <TableCell>
                          {result.score.toFixed(1)} / {result.max_score}
                        </TableCell>
                        <TableCell className={getScoreColor(result.percentage)}>
                          {result.percentage.toFixed(1)}%
                        </TableCell>
                        <TableCell>{result.attempts_count}</TableCell>
                        <TableCell>
                          {result.completed_at
                            ? new Date(result.completed_at).toLocaleDateString(
                                "nl-NL",
                              )
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(result)}
                            className="hover:bg-indigo-50"
                          >
                            <Eye className="w-4 h-4 text-indigo-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* Student Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Resultaat Details</DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            studentDetails && (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Student</h3>
                  <p className="text-gray-800">{studentDetails.student.name}</p>
                  <p className="text-gray-500 text-sm">
                    {studentDetails.student.email}
                  </p>
                </div>

                {/* Test Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Toets</h3>
                  <p className="text-gray-800">{studentDetails.test.title}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Score:</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {studentDetails.attempt.score.toFixed(1)} /{" "}
                      {studentDetails.attempt.max_score}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={studentDetails.attempt.percentage} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Start:</span>
                      <p className="text-gray-800">
                        {new Date(
                          studentDetails.attempt.started_at,
                        ).toLocaleString("nl-NL")}
                      </p>
                    </div>
                    {studentDetails.attempt.completed_at && (
                      <div>
                        <span className="text-gray-500">Voltooid:</span>
                        <p className="text-gray-800">
                          {new Date(
                            studentDetails.attempt.completed_at,
                          ).toLocaleString("nl-NL")}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Pogingen:</span>
                      <p className="text-gray-800">
                        {studentDetails.attempt.attempts_count}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Questions */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Vragen & Antwoorden
                  </h3>
                  <div className="space-y-3">
                    {studentDetails.questions.map((question, index) => (
                      <div
                        key={question.question_id}
                        className={`border rounded-lg p-4 ${question.is_correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              Vraag {index + 1}: {question.question_text}
                            </p>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm">
                                <span className="text-gray-500">Antwoord:</span>{" "}
                                <span
                                  className={
                                    question.is_correct
                                      ? "text-green-700 font-medium"
                                      : "text-red-700"
                                  }
                                >
                                  {question.user_answer || "(geen antwoord)"}
                                </span>
                              </p>
                              {!question.is_correct &&
                                question.correct_answer && (
                                  <p className="text-sm">
                                    <span className="text-gray-500">
                                      Correct antwoord:
                                    </span>{" "}
                                    <span className="text-green-700">
                                      {question.correct_answer}
                                    </span>
                                  </p>
                                )}
                            </div>
                          </div>
                          <div className="ml-4">
                            {question.is_correct ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
