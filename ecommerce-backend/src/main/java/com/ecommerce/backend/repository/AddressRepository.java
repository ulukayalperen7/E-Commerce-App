package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Address;
import com.ecommerce.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
    List<Address> findByUser(User user);
    List<Address> findByUser_UserId(Integer userId);
}