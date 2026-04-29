package com.buy01.media.dto;

import java.util.ArrayList;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseAddMediaEntityWrapper {
    private ArrayList<ResponseAddMediaEntity> response;
}
