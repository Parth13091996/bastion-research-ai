interface DigioOptions {
  environment: "production" | "sandbox";
  callback?: (response: any) => void;
  logo?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  is_redirection_approach?: boolean;
  redirect_url?: string;
  is_iframe?: boolean;
  event_listener?: (event: any) => void;
  event_filter?: {
    events: string[];
  };
}
