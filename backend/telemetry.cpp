#include <iostream>
#include <fstream>
#include <ctime>
#include <chrono>
#include <sys/types.h>
#include <thread>
#include <sstream>
#include <iomanip>
#include "include/nlohmann/json.hpp"

#define CPU_ARRAY_LENGTH 10
#define CPU_IDLE_INDEX 3
#define CPU_IOWAIT_INDEX 4
#define CPU_READS 2
#define CPU_PREV 0
#define CPU_CURRENT 1

#define MEM_LINES 3
#define MEM_TOTAL_INDEX 0
#define MEM_AVAILABLE_INDEX 2

#define JSON_ELEMENTS 4

struct TelemetryData {
    double cpuUsage;
    u_long memoryTotal;
    u_long memoryAvailable;
    std::string timestamp;
};

bool getCpuInfo(u_long* cpuTotal, u_long* cpuIdle) {
    std::ifstream file("/proc/stat");
    if (!file.is_open()) {
        std::cerr << "Error opening /proc/stat" << std::endl;
        return false;
    }
    std::string line;
    if (!std::getline(file, line)) {
        file.close();
        return false;
    }
    std::stringstream ss(line);
    std::string dummy;
    ss >> dummy;
    u_long values[CPU_ARRAY_LENGTH] = {0};
    u_long sumValues = 0;
    for (int i = 0; i < CPU_ARRAY_LENGTH; i++) {
        ss >> values[i];
        sumValues += values[i];
    }
    file.close();
    *cpuTotal = sumValues;
    *cpuIdle = values[CPU_IDLE_INDEX] + values[CPU_IOWAIT_INDEX];
    return true;
}

double calcCpuUsage(u_long prevTotal, u_long prevIdle,
                    u_long currTotal, u_long currIdle) {
    u_long totalDiff = currTotal - prevTotal;
    u_long idleDiff = currIdle - prevIdle;
    return totalDiff ? 100.0 * (totalDiff - idleDiff) / totalDiff : 0.0;
}

bool getMemInfo(u_long* memTotal, u_long* memAvailable) {
    std::ifstream file("/proc/meminfo");
    if (!file.is_open()) {
        std::cerr << "Error opening /proc/meminfo" << std::endl;
        return false;
    }
    for (int i = 0; i < MEM_LINES; i++) {
        std::string line;
        if (!std::getline(file, line)) {
            file.close();
            return false;
        }
        std::stringstream ss(line);
        std::string dummy;
        ss >> dummy;
        if (i == MEM_TOTAL_INDEX) {
            ss >> *memTotal;
        }
        if (i == MEM_AVAILABLE_INDEX) {
            ss >> *memAvailable;
        }
    }
    file.close();
    return true;
}

std::string getCurrentTime() {
    auto now = std::chrono::system_clock::now();
    auto time = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::gmtime(&time), "%Y-%m-%dT%H:%M:%SZ");
    return ss.str();
}

void writeToJson(std::string path, nlohmann::json* j) {
    std::ofstream file(path);
    file << j->dump(JSON_ELEMENTS);
    file.close();
}

int main() {
    while (true) {
        TelemetryData data;

        // read cpu info
        u_long cpuTotal[CPU_READS], cpuIdle[CPU_READS];
        bool readSuccess[CPU_READS];
        for (int i = 0; i < CPU_READS; i++) {
            if (i == 1) {
                std::this_thread::sleep_for(std::chrono::milliseconds(500));
            }
            readSuccess[i] = getCpuInfo(&cpuTotal[i], &cpuIdle[i]);
            if (!readSuccess[i]) {
                std::cerr <<"Error retrieving cpu info." << std::endl;
                return EXIT_FAILURE;
            }
        }
        data.cpuUsage = calcCpuUsage(cpuTotal[CPU_PREV], cpuIdle[CPU_PREV],
                                    cpuTotal[CPU_CURRENT], cpuIdle[CPU_CURRENT]);

        // read memory info
        if (!getMemInfo(&data.memoryTotal, &data.memoryAvailable)) {
            std::cerr <<"Error retrieving memory info." << std::endl;
            return EXIT_FAILURE;
        }

        // get current timestamp
        data.timestamp = getCurrentTime();

        // serialize to json
        nlohmann::json j;
        j["cpuUsage"] = data.cpuUsage;
        j["memoryTotal"] = data.memoryTotal;
        j["memoryAvailable"] = data.memoryAvailable;
        j["timestamp"] = data.timestamp;

        // write to file
        writeToJson("../frontend/public/telemetry.json", &j);

        std::cout << "Successfully updated telemetry." << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(5));
    }
}
