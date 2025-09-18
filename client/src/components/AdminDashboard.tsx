import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Plus, 
  Upload, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  School,
  Building,
  MapPin,
  Flag
} from "lucide-react";
import { School as SchoolType } from "@shared/schema";

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [csvData, setCsvData] = useState("");
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    district: "",
    city: "",
    state: ""
  });

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const response = await fetch("/api/admin/schools");
      const schoolsData = await response.json();
      setSchools(schoolsData);
    } catch (error) {
      console.error("Error loading schools:", error);
      toast({
        title: "Error",
        description: "Failed to load schools",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.district.trim() || !formData.city.trim() || !formData.state.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSchool) {
        // Update existing school
        const response = await fetch(`/api/admin/schools/${editingSchool.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to update school");
        }

        toast({
          title: "School Updated",
          description: "School information has been updated successfully.",
        });
      } else {
        // Create new school
        const response = await fetch("/api/admin/schools", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to create school");
        }

        toast({
          title: "School Added",
          description: "New school has been added successfully.",
        });
      }

      setFormData({ name: "", district: "", city: "", state: "" });
      setShowAddForm(false);
      setEditingSchool(null);
      loadSchools();
    } catch (error) {
      console.error("Error saving school:", error);
      toast({
        title: "Error",
        description: "Failed to save school information.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (school: SchoolType) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      district: school.district,
      city: school.city,
      state: school.state
    });
    setShowAddForm(true);
  };

  const handleDelete = async (schoolId: string) => {
    if (!confirm("Are you sure you want to delete this school?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/schools/${schoolId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete school");
      }

      toast({
        title: "School Deleted",
        description: "School has been deleted successfully.",
      });

      loadSchools();
    } catch (error) {
      console.error("Error deleting school:", error);
      toast({
        title: "Error",
        description: "Failed to delete school.",
        variant: "destructive",
      });
    }
  };

  const handleCsvUpload = async () => {
    if (!csvData.trim()) {
      toast({
        title: "No Data",
        description: "Please paste CSV data or upload a file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Expected headers: name, district, city, state
      const expectedHeaders = ['name', 'district', 'city', 'state'];
      const hasValidHeaders = expectedHeaders.every(header => 
        headers.includes(header)
      );

      if (!hasValidHeaders) {
        toast({
          title: "Invalid CSV Format",
          description: "CSV must have headers: name, district, city, state",
          variant: "destructive",
        });
        return;
      }

      const schoolsData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return {
          name: values[headers.indexOf('name')] || '',
          district: values[headers.indexOf('district')] || '',
          city: values[headers.indexOf('city')] || '',
          state: values[headers.indexOf('state')] || ''
        };
      }).filter(school => school.name && school.district && school.city && school.state);

      const response = await fetch("/api/admin/schools/bulk-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schools: schoolsData }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload schools");
      }

      const result = await response.json();
      const successCount = result.results.filter((r: any) => r.success).length;
      const errorCount = result.results.filter((r: any) => !r.success).length;

      toast({
        title: "Bulk Upload Complete",
        description: `Successfully uploaded ${successCount} schools. ${errorCount} errors.`,
      });

      setCsvData("");
      setShowCsvUpload(false);
      loadSchools();
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload CSV data.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
      };
      reader.readAsText(file);
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading administrator dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Settings className="w-8 h-8" />
                Administrator Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage schools and districts for the assessment platform
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close Dashboard
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <School className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{schools.length}</p>
                    <p className="text-xs text-muted-foreground">Total Schools</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">
                      {new Set(schools.map(s => s.district)).size}
                    </p>
                    <p className="text-xs text-muted-foreground">Districts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">
                      {new Set(schools.map(s => s.city)).size}
                    </p>
                    <p className="text-xs text-muted-foreground">Cities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">
                      {new Set(schools.map(s => s.state)).size}
                    </p>
                    <p className="text-xs text-muted-foreground">States</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New School
            </Button>
            <Button variant="outline" onClick={() => setShowCsvUpload(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload CSV
            </Button>
          </div>

          {/* Add/Edit School Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingSchool ? "Edit School" : "Add New School"}
                </CardTitle>
                <CardDescription>
                  Enter the school information below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">School Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter school name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                        placeholder="Enter district name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Enter city"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="Enter state"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingSchool ? "Update School" : "Add School"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingSchool(null);
                        setFormData({ name: "", district: "", city: "", state: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* CSV Upload */}
          {showCsvUpload && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Schools via CSV</CardTitle>
                <CardDescription>
                  Upload multiple schools at once. CSV format: name, district, city, state
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload CSV File</Label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Or Paste CSV Data</Label>
                  <Textarea
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="name, district, city, state&#10;Lincoln High School, Springfield District, Springfield, IL&#10;Washington Elementary, Springfield District, Springfield, IL"
                    rows={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCsvUpload}>
                    Upload Schools
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowCsvUpload(false);
                      setCsvData("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schools Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Schools ({filteredSchools.length})</CardTitle>
                  <CardDescription>
                    Manage all schools in the system
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search schools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School Name</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell>{school.district}</TableCell>
                        <TableCell>{school.city}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{school.state}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(school)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(school.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
