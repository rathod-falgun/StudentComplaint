package com.project.ComplaintApp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Component
@ConfigurationProperties(prefix = "app.supabase")
@Data
public class SupabaseStorageProperties {

    /** e.g. https://abcxyz.supabase.co */
    private String url;

    /** service_role key from Project Settings → API */
    private String serviceRoleKey;

    private Buckets buckets = new Buckets();

    @Data
    public static class Buckets {
        private String profiles = "profiles";
        private String complaints = "complaints";
    }
}
