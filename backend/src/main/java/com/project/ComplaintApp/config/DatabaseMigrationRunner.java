package com.project.ComplaintApp.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        System.out.println("🔧 Checking database schema compatibility...");

        // 1. Ensure status column in complaints table is VARCHAR(50) so new enum values (like REJECTED) work in MySQL
        try {
            jdbcTemplate.execute("ALTER TABLE complaints MODIFY COLUMN status VARCHAR(50) NOT NULL");
            System.out.println("✅ complaints.status column converted/verified as VARCHAR(50)");
        } catch (Exception e) {
            System.out.println("ℹ️ Note on status column alter: " + e.getMessage());
        }

        // 2. Ensure admin_remarks column exists
        try {
            jdbcTemplate.execute("ALTER TABLE complaints ADD COLUMN admin_remarks TEXT");
            System.out.println("✅ complaints.admin_remarks column created");
        } catch (Exception e) {
            // Already exists or duplicate column name
            System.out.println("ℹ️ complaints.admin_remarks column already exists or skipped: " + e.getMessage());
        }
    }
}
