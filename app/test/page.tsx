'use client'

import { useAuth } from "@/components/auth/auth-provider"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle, Loader2, Database, Shield, Globe, Settings } from "lucide-react"
import { NotificationTest } from "./notification-test"

export default function ComprehensiveTestPage() {
  const { 
    user, 
    profile, 
    signIn, 
    signUp, 
    signOut, 
    loading, 
    testConnection,
    isAdmin
  } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [testResults, setTestResults] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [serverTestResults, setServerTestResults] = useState<any>(null)
  const [envCheck, setEnvCheck] = useState<any>(null)

  const handleTestConnection = async () => {
    setIsTesting(true)
    const success = await testConnection()
    setTestResults({ success, timestamp: new Date().toISOString() })
    setIsTesting(false)
  }

  const handleServerTest = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setServerTestResults({ 
        success: response.ok, 
        data, 
        timestamp: new Date().toISOString() 
      })
    } catch (error: any) {
      setServerTestResults({ 
        success: false, 
        error: error.message, 
        timestamp: new Date().toISOString() 
      })
    }
  }

  const handleAuthHealthTest = async () => {
    try {
      const response = await fetch('/api/auth-health')
      const data = await response.json()
      setTestResults({ 
        success: data.ok, 
        data, 
        timestamp: new Date().toISOString() 
      })
    } catch (error: any) {
      setTestResults({ 
        success: false, 
        error: error.message, 
        timestamp: new Date().toISOString() 
      })
    }
  }

  const checkEnvironment = () => {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    }
    setEnvCheck({ 
      ...env, 
      allPresent: Object.values(env).every(Boolean),
      timestamp: new Date().toISOString() 
    })
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await signIn(email, password)
      console.log("Sign in result:", result)
    } catch (error) {
      console.error("Sign in error:", error)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await signUp(email, password, fullName)
      console.log("Sign up result:", result)
    } catch (error) {
      console.error("Sign up error:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  // Log auth state changes for debugging
  useEffect(() => {
    console.log("Auth state updated:", { user, profile, loading, isAdmin })
  }, [user, profile, loading, isAdmin])

  // Auto-check environment on mount
  useEffect(() => {
    checkEnvironment()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg">Loading authentication state...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full mb-3">
            <Settings className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">System Test</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Comprehensive Test Suite</h1>
          <p className="text-slate-600 mt-1">Test all system components and authentication flows</p>
        </div>
        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="system">System Tests</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="debug">Debug Info</TabsTrigger>
          </TabsList>

          {/* System Tests Tab */}
          <TabsContent value="system" className="space-y-6">
            {/* Environment Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Environment Variables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-600">Check if all required environment variables are present</p>
                  <Button onClick={checkEnvironment} variant="outline" size="sm">
                    Check Environment
                  </Button>
                </div>
                {envCheck && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {envCheck.allPresent ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">
                        {envCheck.allPresent ? 'All variables present' : 'Missing variables'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        {envCheck.NEXT_PUBLIC_SUPABASE_URL ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>SUPABASE_URL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {envCheck.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>SUPABASE_ANON_KEY</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {envCheck.NEXT_PUBLIC_SITE_URL ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>SITE_URL</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Last checked: {envCheck.timestamp}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Server Health Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Server Health Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-600">Test server-side Supabase connection</p>
                  <Button onClick={handleServerTest} variant="outline" size="sm">
                    Test Server
                  </Button>
                </div>
                {serverTestResults && (
                  <div className={`p-4 rounded-lg ${
                    serverTestResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {serverTestResults.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">
                        {serverTestResults.success ? 'Server connection successful' : 'Server connection failed'}
                      </span>
                    </div>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                      {JSON.stringify(serverTestResults.data || serverTestResults.error, null, 2)}
                    </pre>
                    <p className="text-xs text-slate-500 mt-2">Last tested: {serverTestResults.timestamp}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Auth Health Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Auth Endpoint Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-600">Test Supabase Auth endpoint reachability</p>
                  <Button onClick={handleAuthHealthTest} variant="outline" size="sm">
                    Test Auth
                  </Button>
                </div>
        {testResults && (
                  <div className={`p-4 rounded-lg ${
                    testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {testResults.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">
                        {testResults.success ? 'Auth endpoint reachable' : 'Auth endpoint unreachable'}
                      </span>
                    </div>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                      {JSON.stringify(testResults.data || testResults.error, null, 2)}
                    </pre>
                    <p className="text-xs text-slate-500 mt-2">Last tested: {testResults.timestamp}</p>
          </div>
        )}
              </CardContent>
            </Card>

            {/* Toast Test */}
            <Card>
              <CardHeader>
                <CardTitle>Notification System Test</CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationTest />
              </CardContent>
            </Card>


          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="auth" className="space-y-6">
            {/* Current Auth State */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Current Authentication State
                </CardTitle>
              </CardHeader>
              <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      {user ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      User Status
                    </h3>
            {user ? (
                      <div className="space-y-1">
                <p className="text-green-600 font-medium">Authenticated</p>
                        <p className="text-sm text-slate-600">Email: {user.email}</p>
                        <p className="text-sm text-slate-600">ID: {user.id.slice(0, 8)}...</p>
                        <Badge variant={isAdmin ? "default" : "secondary"}>
                          {isAdmin ? "Admin" : "User"}
                        </Badge>
              </div>
            ) : (
              <p className="text-red-600 font-medium">Not authenticated</p>
            )}
          </div>
          
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      {profile ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      Profile Status
                    </h3>
            {profile ? (
                      <div className="space-y-1">
                <p className="text-green-600 font-medium">Profile loaded</p>
                        <p className="text-sm text-slate-600">Name: {profile.full_name || 'N/A'}</p>
                        <p className="text-sm text-slate-600">Role: {profile.role || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-yellow-600 font-medium">No profile data</p>
            )}
          </div>
        </div>
              </CardContent>
            </Card>
      
      {/* Auth Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Authentication Actions</CardTitle>
              </CardHeader>
              <CardContent>
        {user ? (
          <div className="space-y-4">
                    <Button onClick={handleSignOut} variant="destructive">
              Sign Out
                    </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sign In Form */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Sign In</h3>
              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                          <Label htmlFor="signin-email">Email</Label>
                          <Input
                            id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                          <Label htmlFor="signin-password">Password</Label>
                          <Input
                            id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                        <Button type="submit" className="w-full">
                  Sign In
                        </Button>
              </form>
            </div>
            
            {/* Sign Up Form */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Sign Up</h3>
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                          <Label htmlFor="signup-name">Full Name</Label>
                          <Input
                            id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div>
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                        <Button type="submit" variant="outline" className="w-full">
                  Sign Up
                        </Button>
              </form>
            </div>
          </div>
        )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Connection Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-600">Test client-side database connection</p>
                  <Button 
                    onClick={handleTestConnection} 
                    disabled={isTesting}
                    variant="outline" 
                    size="sm"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>
                </div>
                {testResults && (
                  <div className={`p-4 rounded-lg ${
                    testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {testResults.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">
                        {testResults.success ? 'Database connection successful' : 'Database connection failed'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Last tested: {testResults.timestamp}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Debug Info Tab */}
          <TabsContent value="debug" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Debug Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user && (
                  <div>
                    <h3 className="font-medium mb-2">User Object</h3>
                    <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto">
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  </div>
                )}
                
                {profile && (
                  <div>
                    <h3 className="font-medium mb-2">Profile Object</h3>
                    <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto">
                      {JSON.stringify(profile, null, 2)}
                    </pre>
      </div>
                )}

                <div>
                  <h3 className="font-medium mb-2">Environment Check</h3>
                  <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto">
                    {JSON.stringify(envCheck, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}