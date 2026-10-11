export interface MonitorSignal {
 id: string;
 platform: string;
 source_url: string | null;
 source_note: string;
 excerpt: string;
 category: string;
 priority: number;
 status: string;
 proposed_topic_id: string | null;
 response_body: string | null;
 response_status: string;
 created_at: string;
}
