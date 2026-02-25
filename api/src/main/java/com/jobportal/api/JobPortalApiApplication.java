package com.jobportal.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class JobPortalApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobPortalApiApplication.class, args);
	}

}
