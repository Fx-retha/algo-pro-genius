-- Create a table to track mentor applications
CREATE TABLE public.mentor_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.mentor_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own application
CREATE POLICY "Users can view their own application"
ON public.mentor_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own application
CREATE POLICY "Users can create their own application"
ON public.mentor_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.mentor_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update applications (approve/reject)
CREATE POLICY "Admins can update applications"
ON public.mentor_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete applications
CREATE POLICY "Admins can delete applications"
ON public.mentor_applications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_mentor_applications_updated_at
BEFORE UPDATE ON public.mentor_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();