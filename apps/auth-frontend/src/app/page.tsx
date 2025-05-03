"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authApi } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import type { LoginInput, RegisterFormData } from "@sentinel/shared-schemas"

export default function Home() {
  const { toast } = useToast()

  async function onLoginSubmit(values: LoginInput) {
    try {
      const response = await authApi.login(values)
      
      // Store tokens in localStorage or a secure storage
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      toast({
        title: "Success!",
        description: "You have been logged in successfully.",
      })
  
      // TODO: Redirect to dashboard or home page
    } catch (error) {
      console.error('Login error:', error)
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Failed to log in. Please try again.",
      })
    }
  }

  async function onRegisterSubmit(values: RegisterFormData) {
    try {
      const { confirmPassword, ...registerData } = values
      const response = await authApi.register(registerData)
      
      // Store tokens in localStorage or a secure storage
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
      })
      
      // TODO: Redirect to dashboard or home page
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to create account. Please try again.",
      })
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Auth Platform</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm onSubmit={onLoginSubmit} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm onSubmit={onRegisterSubmit} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
} 