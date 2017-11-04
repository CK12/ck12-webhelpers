@test "Test modality.visited" {
    value=$RANDOM
    run test_event modality visited ${value}
    [ "${output}" == "${value}" ]
}

@test "Test modality.shared" {
    value=$RANDOM
    run test_event modality shared ${value}
    [ "${output}" == "${value}" ]
}

@test "Test modality.clicked" {
    value=$RANDOM
    run test_event modality clicked ${value}
    [ "${output}" == "${value}" ]
}

@test "Test modality.time_spent" {
    value=$RANDOM
    run test_event modality time_spent ${value}
    [ "${output}" == "${value}" ]
}
