
import { spawn } from 'child_process';

const logOutput = (name) => (message) => console.log(`[${name}] ${message}`)

export default function run(TARGET) {
  return new Promise((resolve, reject) => {
    const process = spawn('python', ['./algorithm/GeneticAlgorithm.py', TARGET]);

    const out = []
    process.stdout.on(
      'data',
      (data) => {
          console.log(data);
        out.push(data.toString());
        logOutput('stdout')(data);
      }
    );
    
    const err = []
    process.stderr.on(
      'data',
      (data) => {
        err.push(data.toString());
        logOutput('stderr')(data);
      }
    );

    process.on('exit', (code, signal) => {
      logOutput('exit')(`${code} (${signal})`)
      if (code !== 0) {
        reject(new Error(err.join('\n')))
        return
      }
      try {
        resolve(out[0]);
      } catch(e) {
        reject(e);
      }
    });
  });
}

(async () => {
  try {
    const output = await run()
    logOutput('Received')(output.message)
    process.exit(0)
  } catch (e) {
    console.error('Error during script execution ', e.stack);
    process.exit(1);
  }
})();