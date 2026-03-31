package com.buy01.user.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Data
@NoArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;   // BCrypt hashed — never plain text

    private String firstName;
    private String lastName;
    private String avatarUrl;  // set later via Media Service

    private Role role;         // CLIENT or SELLER
}