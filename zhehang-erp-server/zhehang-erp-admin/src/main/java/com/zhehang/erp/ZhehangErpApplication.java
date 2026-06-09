package com.zhehang.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableAsync
@EnableScheduling
@SpringBootApplication
public class ZhehangErpApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZhehangErpApplication.class, args);
        System.out.println("===========================================");
        System.out.println("    ZheHang ERP System Started Successfully");
        System.out.println("===========================================");
    }
}