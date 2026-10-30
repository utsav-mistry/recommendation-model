package com.ecommerce.dto;

import com.ecommerce.model.Address;
import com.ecommerce.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UserRegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    private String phone;
    private Role role = Role.CUSTOMER;
    private Address address;

    public UserRegisterRequest() {
    }

    public UserRegisterRequest(String name, String email, String phone, Role role, Address address) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role != null ? role : Role.CUSTOMER;
        this.address = address;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }
}
