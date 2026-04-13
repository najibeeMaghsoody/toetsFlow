
import { useState, useEffect } from "react";
import {
  Eye,
  Download,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  ArrowLeft,
} from "lucide-react";
import {
  getTestResults,
  exportResultsToCsv,
  getStudentResultDetail,
} from "../../services/teacherService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";

export function ResultsTab({ tests, selectedTest, onSelectTest }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    if (selectedTest) {
      loadResults();
    }
  }, [selectedTest]);

  const loadResults = async () => {
    if (!selectedTest) return;

    setLoading(true);
    try {
      const data = await getTestResults(selectedTest.id);
      setResults(data);
      calculateStatistics(data);
    } catch (error) {
      console.error("Error loading results:", error);
      toast.error("Fout bij laden resultaten");
    } finally {
      setLoading(false);
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
    try {
      await exportResultsToCsv(selectedTest.id);
    } catch (error) {
      console.error("Export error:", error);
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
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" /> Voltooid
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" /> Bezig
      </Badge>
    );
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 55) return "text-yellow-600";
    return "text-red-600";
  };

  if (!selectedTest) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Geen toets geselecteerd
        </h3>
        <p className="text-gray-500">
          Selecteer een toets om de resultaten te bekijken
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {tests.map((test) => (
            <Button
              key={test.id}
              variant="outline"
              onClick={() => onSelectTest(test)}
            >
              {test.title}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedTest.title}
            </h2>
            <p className="text-gray-500 mt-1">{selectedTest.description}</p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporteer CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Progress value={statistics.averageScore} className="mt-2" />
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
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.passRate}%</div>
              <p className="text-xs text-gray-500">55% of hoger</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
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
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Pogingen</TableHead>
              <TableHead>Voltooid op</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : filteredResults.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  Geen resultaten gevonden
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.map((result) => (
                <TableRow key={result.student_id}>
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
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(result)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Student Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resultaat Details</DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            studentDetails && (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Student</h3>
                  <p className="text-gray-700">{studentDetails.student.name}</p>
                  <p className="text-gray-500 text-sm">
                    {studentDetails.student.email}
                  </p>
                </div>

                {/* Test Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Toets</h3>
                  <p className="text-gray-700">{studentDetails.test.title}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Score:</span>
                    <span className="text-lg font-bold text-purple-600">
                      {studentDetails.attempt.score.toFixed(1)} /{" "}
                      {studentDetails.attempt.max_score}
                    </span>
                  </div>
                  <div className="mt-1">
                    <Progress value={studentDetails.attempt.percentage} />
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>
                      Start:{" "}
                      {new Date(
                        studentDetails.attempt.started_at,
                      ).toLocaleString("nl-NL")}
                    </p>
                    {studentDetails.attempt.completed_at && (
                      <p>
                        Voltooid:{" "}
                        {new Date(
                          studentDetails.attempt.completed_at,
                        ).toLocaleString("nl-NL")}
                      </p>
                    )}
                    <p>
                      Aantal pogingen: {studentDetails.attempt.attempts_count}
                    </p>
                  </div>
                </div>

                {/* Questions */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Vragen</h3>
                  <div className="space-y-4">
                    {studentDetails.questions.map((question, index) => (
                      <div
                        key={question.question_id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              Vraag {index + 1}: {question.question_text}
                            </p>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm">
                                <span className="text-gray-500">
                                  Jouw antwoord:
                                </span>{" "}
                                <span
                                  className={
                                    question.is_correct
                                      ? "text-green-600"
                                      : "text-red-600"
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
                                    <span className="text-green-600">
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
